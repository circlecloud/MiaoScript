/**
 * 符合 CommonJS 规范的 模块化加载
 *
 */
/*global Java, base*/
(function (parent) {
    'use strict';
    var File = Java.type("java.io.File");
    var separatorChar = File.separatorChar;
    var paths = [parent, parent + separatorChar + 'core', parent + separatorChar + 'modules'];

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
        if (file.isFile()) {
            return file;
        }
        var ef = new File(normalizeName(_canonical(file)));
        if (ef.isFile()) {
            return ef;
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
            if (json.main) {
                return resolveAsFile(dir, json.main);
            }
        }
        // if no package or package.main exists, look for index.js
        return resolveAsFile(dir, 'index.js');
    }

    function normalizeName(fileName, ext) {
        var extension = ext || '.js';
        if (fileName.endsWith(extension)) {
            return fileName;
        }
        return fileName + extension;
    }

    /**
     * 预编译模块
     * @param file JS文件
     * @param optional 附加选项
     * @returns {Object}
     */
    function compileJs(file, optional) {
        var cacheFile = _cacheFile(file);
        var origin = base.read(file);
        if (optional.hook) {
            origin = optional.hook(origin);
        }
        base.save(cacheFile, "(function (module, exports, require, __dirname, __filename) {" + origin + "});");
        // 使用 load 可以保留行号和文件名称
        var obj = load(cacheFile);
        base.delete(cacheFile);
        return obj;
    }

    /**
     * 编译模块
     * @param id 模块ID
     * @param name 模块名称
     * @param file 模块文件
     * @param optional 附加选项
     * @returns {Object}
     */
    function compileModule(id, name, file, optional) {
        console.debug('加载模块 %s 位于 %s Optional %s'.format(name, id, optional.toJson()));
        // noinspection JSUnresolvedVariable
        var module = {
            id: id,
            exports: {},
            loaded: false,
            require: exports(file.parentFile)
        };
        try {
            var compiledWrapper = compileJs(file, optional);
            compiledWrapper.apply(module.exports, [
                module, module.exports, module.require, file.parentFile, file
            ]);
            console.debug('模块 %s 编译成功!'.format(name));
            module.loaded = true;
        } catch (ex) {
            console.console("§4警告! §c模块 §a%s §c编译失败! §4ERR: %s".format(name, ex));
            console.ex(ex);
        }
        return module;
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

    function _cacheFile(file) {
        return cacheDir + separatorChar + file.name;
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
        var file = _canonical(name) ? name : resolve(name, path);
        if (file === undefined) {
            console.console("§c模块 §a%s §c加载失败! §4未找到该模块!".format(name));
            return {exports: {}};
        }
        if (!optional) optional = {cache: true};
        // 重定向文件名称和类型
        name = file.name.split(".")[0];
        var id = _canonical(file);
        var module = cacheModules[id];
        if (optional.cache && module) {
            return module;
        }
        cacheModules[id] = module = compileModule(id, name, file, optional);
        return module;
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

    var cacheDir = parent + separatorChar + "runtime";

    // 等于 undefined 说明 parent 是一个字符串 需要转成File
    // 可能有更加准确的方案
    if (_canonical(parent) === undefined) {
        parent = new File(parent);
    }
    var cacheModules = [];
    console.debug("初始化 require 模块组件 父目录 ", _canonical(parent));
    return exports(parent);
});