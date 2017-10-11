/**
 * 符合 CommonJS 规范的 模块化加载
 *
 */
/*global Java, base*/
(function (parent) {
    'use strict';
    var File = Java.type("java.io.File");
    var paths = ['', parent, parent + '/core', parent + '/kit', parent + '/modules'];

    /**
     * 解析模块名称为文件
     * 按照下列顺序查找
     * 当前目录 ./
     * 父目录 ../
     * 核心目录 /core
     * 模块目录 /modules
     * @param name 模块名称
     */
    function resolve(name, parent) {
        if (_canonical(name)) {
            name = _canonical(name);
        }
        var temp = [parent].concat(paths);
        for(var i in temp) {
            var path = temp[i];
            var result = resolveAsFile(path, name) || resolveAsDirectory(path, name);
            if (result) {
               return result;
            }
        }
        return undefined;
    }

    /**
     * 解析文件
     * @returns {*}
     */
    function resolveAsFile(dir, file) {
        var file = ext.notNull(dir) ? new File(dir, file) : new File(file);
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
        var file = ext.notNull(dir) ? new File(dir, file) : new File(file);
        var _package = new File(file, 'package.json');
        if (_package.exists()) {
            var json = JSON.parse(base.read(_package));
            if (json.main) {
                return resolveAsFile(file, json.main);
            }
        }
        // if no package or package.main exists, look for index.js
        return resolveAsFile(file, 'index.js');
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
     * @param file
     * @returns {Object}
     */
    function compileJs(file) {
        var cacheFile = _cacheFile(file);
        base.save(cacheFile, "(function (module, exports, require) {" + base.read(file) + "});");
        // 使用 load 可以保留行号和文件名称
        var obj = load(cacheFile);
        base.delete(cacheFile);
        return obj;
    }

    /**
     * 编译模块
     * @param id
     * @param name
     * @param file
     * @returns {Object}
     */
    function compileModule(id, name, file) {
        log.d('加载模块 %s 位于 %s', name, id);
        // noinspection JSUnresolvedVariable
        var module = {
            id: id,
            exports: {},
            loaded: false,
            require: exports(file.parentFile)
        };
        try {
            var compiledWrapper = compileJs(file);
            compiledWrapper.apply(module.exports, [
                module, module.exports, module.require
            ]);
            log.d('模块 %s 编译成功!', name);
            module.loaded = true;
        } catch (ex) {
            log.w("模块 %s 编译失败!", name);
            log.d(ex);
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
        return cacheDir + "/" + file.name;
    }

    /**
     * 加载模块
     * @param name 模块名称
     * @param path 路径
     * @returns {*}
     * @private
     */
    function _require(name, path) {
        var file = resolve(name, path);
        if (file === undefined) {
            log.w("模块 %s 加载失败! 未找到该模块!", name);
            return {exports:{}};
        }
        // 重定向文件名称和类型
        name = file.name.split(".")[0];
        var id = _canonical(file);
        var module = cacheModules[id];
        if (module) {
            return module;
        }
        cacheModules[id] = module = compileModule(id, name, file);
        return module;
    }

    /**
     * 闭包方法
     * @param parent 父目录
     * @returns {Function}
     */
    function exports(parent) {
        return function (path) {
            return _require(path, parent).exports;
        };
    }

    var cacheDir = parent + "/runtime";

    // 等于 undefined 说明 parent 是一个字符串 需要转成File
    // 可能有更加准确的方案
    if (_canonical(parent) === undefined) {
        parent = new File(parent);
    }
    var cacheModules = [];
    log.d("初始化 require 模块组件 父目录 %s", _canonical(parent));
    return exports(parent);
});