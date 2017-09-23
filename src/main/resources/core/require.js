/**
 * 符合 CommonJS 规范的 模块化加载
 *
 */
/*global Java, base*/
(function (parent, core_dir, miao_module_dir) {
    'use strict';
    var File = Java.type("java.io.File");
    var Files = Java.type("java.nio.file.Files");
    var String = Java.type("java.lang.String");
    var StandardCopyOption = Java.type("java.nio.file.StandardCopyOption");

    /**
     * 解析模块名称为文件
     * 按照下列顺序查找
     * 当前目录 ./
     * 父目录 ../
     * 核心目录 /core
     * 模块目录 /modules
     * @param name 模块名称
     */
    function findModule(name) {
        if (_canonical(name)) {
            name = _canonical(name);
        }
        if (!name.match(/.*\.js/)) {
            name += ".js";
        }
        var jsFile = new File(name);
        if (jsFile.exists()) {
            return jsFile;
        }
        var parentFile = new File(parent, name);
        if (parentFile.exists()) {
            return parentFile;
        }
        var coreFile = new File(core_dir, name);
        if (coreFile.exists()) {
            return coreFile;
        }
        var moduleFile = new File(miao_module_dir, name);
        if (moduleFile.exists()) {
            return moduleFile;
        }
        log.w("模块 %s 加载失败! 下列目录中未找到该模块!", name);
        log.w("当前目录: %s", _canonical(jsFile));
        log.w("上级目录: %s", _canonical(parentFile));
        log.w("核心目录: %s", _canonical(coreFile));
        log.w("模块目录: %s", _canonical(moduleFile));
    }

    /**
     * 预编译模块
     * @param name
     * @param src
     * @returns {Object}
     */
    function compileJs(name, src) {
        var head = "(function (module, exports, require) {\n";
        var tail = "\n});";
        var fulljs = head + src + tail;
        var cacheFile = cacheDir + "/" + name + ".js";
        log.d(cacheFile);
        base.save(cacheFile, fulljs);
        return load(cacheFile);
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
     * 加载模块
     * @param name 模块名称
     * @param parent 父目录
     * @returns {*}
     * @private
     */
    function _require(name, parent) {
        var file = findModule(name, parent);
        // 重定向文件名称
        name = file.name.split(".")[0];
        var id = _canonical(file);
        var module = cacheModules[id];
        if (module) {
            return module;
        }
        log.d('加载模块 %s 位于 %s', name, id);
        module = {
            loaded: false,
            id: id,
            exports: {},
            require: exports(file.parentFile)
        };
        var src = base.read(file);
        try {
            // 预编译模块
            var compiledWrapper = compileJs(name, src);
            compiledWrapper.apply(module.exports, [
                module, module.exports, module.require
            ]);
        } catch (ex) {
            log.w("模块 %s 编译失败!", name);
            log.d(ex);
            return;
        }
        log.d('模块 %s 编译成功!', name);
        module.loaded = true;
        cacheModules[id] = module;
        return cacheModules[id];
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

    var cacheDir = parent + "/cache";

    // 等于 undefined 说明 parent 是一个字符串 需要转成File
    // 可能更加准确的方案
    if (_canonical(parent) === undefined) {
        parent = new File(parent);
    }
    var cacheModules = [];
    log.d("初始化 require 模块组件 父目录 %s", _canonical(parent));
    return exports(parent);
});