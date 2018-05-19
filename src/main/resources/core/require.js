/**
 * 符合 CommonJS 规范的 类似 Node 的模块化加载
 * 一. 注: MiaoScript 中 require.main 不存在
 * 二. 加载 require 流程 例如 在 dir 目录下 调用 require('xx');
 *   a) 加载流程
 *     1. 如果xx模块是一个內建模块
 *       a. 编译并返回该模块
 *       b. 停止执行
 *     2. 如果模块以 `./` `../` 开头
 *       a. 尝试使用 resolveAsFile(dir/xx) 加载文件
 *       b. 尝试使用 resolveAsDirectory(dir/xx) 加载目录
 *     3. 尝试去 root root/core root/modules => xx 加载模块
 *       a. 尝试使用 resolveAsFile(xx/xx) 加载文件
 *       b. 尝试使用 resolveAsDirectory(xx/xx) 加载目录
 *     4. 抛出 not found 异常
 *   b) resolveAsFile 解析流程
 *     1. 如果 xx 是一个文件 则作为 `javascript` 文本加载 并停止执行
 *     2. 如果 xx.js 是一个文件 则作为 `javascript` 文本加载 并停止执行
 *     3. 如果 xx.json 是一个文件 则使用 `JSON.parse(xx.json)` 解析为对象加载 并停止执行
 *     暂不支持 4. 如果 xx.msm 是一个文件 则使用MScript解析器解析 并停止执行
 *   c) resolveAsDirectory 解析流程
 *     1. 如果 xx/package.json 存在 则使用 `JSON.parse(xx/package.json)` 解析并取得 main 字段使用 resolveAsFile(main) 加载
 *     2. 如果 xx/index.js 存在 则使用 resolveAsFile(xx/index.js) 加载
 *     3. 如果 xx/index.json 存在 则使用 `xx/index.json` 解析为对象加载 并停止执行
 *     暂不支持 4. 如果 xx/index.msm 是一个文件 则使用MScript解析器解析 并停止执行
 *   注: MiaoScript 暂不支持多层 modules 加载 暂时不需要(估计以后也不会需要)
 */
/*global Java, base*/
(function (parent) {
    'use strict';
    var File = Java.type("java.io.File");
    var separatorChar = File.separatorChar;
    var cacheDir = parent + separatorChar + "runtime";
    var paths = [parent, parent + separatorChar + 'core', parent + separatorChar + 'api', parent + separatorChar + 'modules'];

    try {
        base.delete(cacheDir);
    } catch (ex) {
        console.ex(ex);
    }

    /**
     * 判断是否为一个文件
     * @param file
     * @returns {*}
     * @private
     */
    function _isFile(file) {
        return file.isFile && file.isFile();
    }

    /**
     * 获得文件规范路径
     * @param file
     * @returns {*}
     * @private
     */
    function _canonical(file) {
        // noinspection JSUnresolvedVariable
        return file.canonicalPath;
    }

    /**
     * 获得缓存的文件名称
     * @param file
     * @returns {string}
     * @private
     */
    function _cacheFile(file) {
        return _canonical(file).replace(parent, cacheDir);
    }

    /**
     * 解析模块名称为文件
     * 按照下列顺序查找
     * 当前目录 ./
     * 父目录 ../
     * 核心目录 /core
     * 模块目录 /modules
     * @param name 模块名称
     * @param parent 父目录
     */
    function resolve(name, parent) {
        name = _canonical(name) || name;
        // 解析本地目录
        if (name.startsWith('./') || name.startsWith('../')) {
            return resolveAsFile(parent, name) || resolveAsDirectory(parent, name) || undefined;
        } else {
            // 查找可能存在的路径
            for (var i in paths) {
                var path = paths[i];
                var result = resolveAsFile(path, name) || resolveAsDirectory(path, name);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }

    /**
     * 解析文件
     * @returns {*}
     */
    function resolveAsFile(dir, file) {
        file = ext.notNull(dir) ? new File(dir, file) : new File(file);
        // 直接文件
        if (file.isFile()) {
            return file;
        }
        // JS文件
        var js = new File(normalizeName(_canonical(file), ".js"));
        if (js.isFile()) {
            return js;
        }
        // JSON文件
        var json = new File(normalizeName(_canonical(file), ".json"));
        if (json.isFile()) {
            return json;
        }
    }

    /**
     * 解析目录
     * @returns {*}
     */
    function resolveAsDirectory(dir, file) {
        dir = ext.notNull(dir) ? new File(dir, file) : new File(file);
        var _package = new File(dir, 'package.json');
        if (_package.exists()) {
            var json = JSON.parse(base.read(_package));
            /** @namespace json.main */
            if (json.main) {
                return resolveAsFile(dir, json.main);
            }
        }
        // if no package or package.main exists, look for index.js
        return resolveAsFile(dir, 'index.js');
    }

    /**
     * 后缀检测和添加
     * @param fileName 文件名称
     * @param ext 后缀
     * @returns {*}
     */
    function normalizeName(fileName, ext) {
        var extension = ext || '.js';
        if (fileName.endsWith(extension)) {
            return fileName;
        }
        return fileName + extension;
    }

    /**
     * 编译模块
     * @param id 模块ID
     * @param name 模块名称
     * @param file 模块文件
     * @param optional 附加选项
     * @returns {Object}
     */
    function getCacheModule(id, name, file, optional) {
        var module = cacheModules[id];
        if (optional.cache && module) {
            return module;
        }
        console.debug('加载模块', name, '位于', id, 'Optional', JSON.stringify(optional));
        // noinspection JSUnresolvedVariable
        module = {
            id: id,
            exports: {},
            loaded: false,
            require: exports(file.parentFile)
        };
        cacheModules[id] = module;
        try {
            if (_canonical(file).endsWith('.js')) {
                compileJs(module, file, optional);
            }
            if (_canonical(file).endsWith('.json')) {
                compileJson(module, file, optional);
            }
            if (_canonical(file).endsWith('.msm')) {
                // noinspection ExceptionCaughtLocallyJS
                throw Error("暂不支持解析 MiaoScript 模块");
            }
        } catch (ex) {
            console.console('§4警告! §c模块§a', name, '§c编译失败! §4ERR:', ex);
            console.ex(ex);
        }
        return module;
    }

    /**
     * 预编译JS
     * @param module JS模块
     * @param file JS文件
     * @param optional 附加选项
     * @returns {Object}
     */
    function compileJs(module, file, optional) {
        var cacheFile = _cacheFile(file);
        var origin = base.read(file);
        if (optional.hook) {
            origin = optional.hook(origin);
        }
        base.save(cacheFile, "(function $(module, exports, require, __dirname, __filename) {" + origin + "});");
        // 使用 load 可以保留行号和文件名称
        var compiledWrapper = engineLoad(cacheFile);
        try {
            base.delete(cacheFile);
        } catch (ex) {
            cacheFile.deleteOnExit();
        }
        compiledWrapper.apply(module.exports, [
            module, module.exports, module.require, file.parentFile, file
        ]);
        module.loaded = true;
    }

    /**
     * 预编译Json
     * @param module Json模块
     * @param file Json 文件
     * @param optional 附加选项
     * @returns {Object}
     */
    function compileJson(module, file, optional) {
        module.exports = JSON.parse(base.read(file));
        module.loaded = true;
    }

    /**
     * 加载模块
     * @param name 模块名称
     * @param path 路径
     * @param optional 附加选项
     * @returns {*}
     * @private
     */
    function _require(name, path, optional) {
        var file = new File(name);
        file = _isFile(file) ? file : resolve(name, path);
        optional = Object.assign({cache: true, warnNotFound: true}, optional);
        if (file === undefined) {
            if (optional.warnNotFound) {
                console.console('§c目录§b', path, '§c下模块§a', name, '§c加载失败! §4未找到该模块!');
            }
            return {exports: {}};
        }
        // 重定向文件名称和类型
        return getCacheModule(_canonical(file), file.name.split(".")[0], file, optional);
    }

    /**
     * 闭包方法
     * @param parent 父目录
     * @returns {Function}
     */
    function exports(parent) {
        return function (path, optional) {
            return _require(path, parent, optional).exports;
        };
    }

    if (typeof parent === "string") {
        parent = new File(parent);
    }
    var cacheModules = [];
    console.debug("初始化 require 模块组件 父目录 ", _canonical(parent));
    return exports(parent);
});
