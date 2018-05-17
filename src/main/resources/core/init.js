'use strict';
/*global base*/

(function (global) {
    // noinspection JSUnusedLocalSymbols
    global.init = function init(root) {
        global.root = root;
        global.noop = function () {
        };
        var startTime = new Date().getTime();
        loadCore();
        loadPatch();
        loadRequire();
        try {
            loadServerLib();
            loadPlugins();
        } catch (ex) {
            console.console("§4初始化插件基础系统库错误:§c", ex);
            console.ex(ex);
        }
        console.log('MiaoScript Engine Load Complete... Done (' + (new Date().getTime() - startTime) / 1000 + 's)!');
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
        global.engineLoad = load;
        global.load = function __denyGlobalLoad__() {
            throw new Error('系统内部不许允许使用 load 如需执行脚本 请使用 engineLoad !');
        };
        // 初始化加载器
        global.require = engineLoad(root + '/core/require.js')(root);
        global.requireInternal = function requireInternal(name) {
            return require(root + '/internal/' + DetectServerType + '/' + name + '.js', arguments[1]);
        }
    }

    /**
     * 加载补丁
     */
    function loadPatch() {
        java.nio.file.Files.list(new java.io.File(root, 'core/patch').toPath()).forEach(function (path) {
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
        global.setTimeout = function setTimeout(func, time, _async) {
            return _async ? task.laterAsync(func, time) : task.later(func, time);
        };
        global.clearTimeout = function clearTimeout(task) {
            task.cancel();
        };
        global.setInterval = function setInterval(func, time, _async) {
            return _async ? task.timerAsync(func, time) : task.timer(func, time);
        };
        global.clearInterval = function clearInterval(task) {
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
    global.engineDisable = function disable() {
        try {
            if (global.manager && global.manager.$) {
                global.manager.disable();
            }
            var server = require('api/server');
            if (server.shutdown) {
                server.shutdown();
            }
        } catch (ex) {
            console.console("§3MiaoScript Engine §aShutDown §4Error... ERR: ", ex);
            console.ex(ex);
        }
    }
})(global);
