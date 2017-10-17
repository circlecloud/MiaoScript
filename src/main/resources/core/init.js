'use strict';
var global = this;
/*global base*/

// noinspection JSUnusedLocalSymbols
function init(root, plugin) {
    global.root = root;
    loadCore();
    loadRequire();
    loadLib4Bukkit();
    loadPlugins(plugin);
}

/**
 * 初始化核心
 */
function loadCore() {
    // 加载基础模块
    load(root + '/core/ext.js');
    load(root + '/core/console.js');
    // 加载补丁和扩展
    load(root + '/core/patch.js');
}

/**
 * 初始化模块
 */
function loadRequire() {
    // 初始化加载器
    global.require = load(root + '/core/require.js')(root);
}

function loadLib4Bukkit() {
    require('modules/event');
    var task = require('modules/task');
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
function loadPlugins(plugin) {
    // 初始化本体插件
    global.pluginManager = require('modules/plugin');
    pluginManager.init(plugin, root + '/plugins');
    // 只有当在正式环境运行的时候才加载
    if (pluginManager.$) {
        pluginManager.load();
        pluginManager.enable();
    }
}

// noinspection JSUnusedLocalSymbols
/**
 * 关闭插件Hook
 */
function disablePlugins() {
    if (pluginManager.$) {
        pluginManager.disable();
    }
}