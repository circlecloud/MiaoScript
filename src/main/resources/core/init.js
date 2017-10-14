'use strict';
var global = this;
/*global base*/

// noinspection JSUnusedLocalSymbols
function init(root, plugin) {
    global.root = root;
    initDir();
    loadCore();
    loadRequire();
    loadLib4Bukkit();
    loadPlugins(plugin);
}

/**
 * 初始化目录
 */
function initDir() {
    // 核心目录
    global.core_dir = root + "/core";
    // 模块目录
    global.miao_module_dir = root + "/modules";
    // 插件目录
    global.plugins_dir = root + "/plugins";
}

/**
 * 初始化核心
 */
function loadCore() {
    // 加载基础模块
    load(core_dir + '/ext.js');
    load(core_dir + '/console.js');
    // 加载补丁和扩展
    load(core_dir + '/patch.js');
}

/**
 * 初始化模块
 */
function loadRequire() {
    // 初始化加载器
    global.require = load(core_dir + '/require.js')(root);
}

function loadLib4Bukkit() {
    require('modules/event');
    var task = require('modules/task');
    global.setTimeout = function (func, time, async) {
        return async ? task.laterAsync(func, time) : task.later(func, time);
    };
    global.clearTimeout = function (task) {
        task.cancel();
    };
    global.setInterval = function (func, time, async) {
        return async ? task.timerAsync(func, time) : task.timer(func, time);
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
    pluginManager.init(plugin, plugins_dir);
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