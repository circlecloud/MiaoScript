'use strict';
var global = this;
/*global base*/

// noinspection JSUnusedLocalSymbols
function init(root) {
    global.root = root;
    global.noop = function () {};
    loadCore();
    loadRequire();
    loadPatch();
    loadServerLib();
    loadPlugins();
}

/**
 * 初始化核心
 */
function loadCore() {
    // 加载基础模块
    load(root + '/core/ext.js');
    // 探测服务器类型
    load(root + '/core/detect.js');
    // 加载Console
    load(root + '/core/console.js');
}

/**
 * 初始化模块
 */
function loadRequire() {
    // 初始化加载器
    global.require = load(root + '/core/require.js')(root);
}

/**
 * 加载补丁
 */
function loadPatch() {
    // 加载补丁和扩展
    load(root + '/core/patch.js');
}

/**
 * 加载Bukkit的类库
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
    if (manager) {
        manager.init('plugins');
        // 只有当在正式环境运行的时候才加载
        manager.load();
        manager.enable();
    } else {
        console.console('§4当前服务器不支持使用MiaoScript插件系统!');
    }
}

// noinspection JSUnusedLocalSymbols
/**
 * 关闭插件Hook
 */
function disablePlugins() {
    if (manager && manager.$) {
        manager.disable();
    }
}