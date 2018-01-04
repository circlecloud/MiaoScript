'use strict';
/*global base*/

(function (global) {
    // noinspection JSUnusedLocalSymbols
    global.init = function init(root) {
        global.root = root;
        global.noop = function () {
        };
        loadCore();
        loadExt();
        loadRequire();
        try {
            loadServerLib();
            loadPlugins();
        } catch (ex) {
            console.console("§4初始化插件基础系统库错误:§c", ex);
            console.ex(ex);
        }
    };

    /**
     * 初始化核心
     */
    function loadCore() {
        // 加载基础模块
        load(root + '/core/ext.js');
        // 加载Console
        load(root + '/core/console.js');
        // 探测服务器类型
        load(root + '/core/detect.js');
    }

    /**
     * 初始化模块
     */
    function loadRequire() {
        // 初始化加载器
        global.require = load(root + '/core/require.js')(root);
        global.requireInternal = function (name) {
            return require(root + '/internal/' + DetectServerType + '/' + name + '.js');
        }
    }

    /**
     * 加载补丁
     */
    function loadExt() {
        java.nio.file.Files.list(new java.io.File(root, 'core/ext').toPath()).forEach(function (path) {
            console.log('加载扩展类库', path);
            try {
                load(path.toFile());
            } catch (ex) {
                console.ex(ex);
            }
        })
    }

    /**
     * 加载系统类库
     */
    function loadServerLib() {
        var task = require('api/task');
        global.setTimeout = function (func, time, _async) {
            return _async ? task.laterAsync(func, time) : task.later(func, time);
        };
        global.clearTimeout = function (task) {
            task.cancel();
        };
        global.setInterval = function (func, time, _async) {
            return _async ? task.timerAsync(func, time) : task.timer(func, time);
        };
        global.clearInterval = function (task) {
            task.cancel();
        };
    }

    /**
     * 加载JS插件
     */
    function loadPlugins() {
        // 初始化本体插件
        global.manager = require('api/plugin');
        if (global.manager && global.manager.$) {
            global.manager.init('plugins');
            // 只有当在正式环境运行的时候才加载
            global.manager.load();
            global.manager.enable();
        } else {
            console.console('§4当前服务器不支持使用MiaoScript插件系统!');
        }
    }

    // noinspection JSUnusedLocalSymbols
    /**
     * 关闭插件Hook
     */
    global.disable = function disable() {
        if (global.manager && global.manager.$) {
            global.manager.disable();
        }
    }
})(global);