'use strict';
/**
 * MiaoScript脚本插件加载类
 */
/*global Java, base, module, exports, require, __FILE__*/
var zip = require("core/zip");
var fs = require('core/fs');

/**
 * 载入插件
 * @param path
 */
function loadPlugins(path) {
    path = fs.file(path);
    log.i("开始扫描 %s 下的插件...", path);
    updatePlugins(path);
    var files = [];
    fs.list(path).forEach(function (file) {
        files.push(file.toFile());
    });
    loadZipPlugin(files);
    loadJsPlugin(files);
}

/**
 * 更新插件
 * @param path
 */
function updatePlugins(path) {
    var update = fs.file(path, "update");
    fs.list(update).forEach(function (file) {
        fs.move(fs.file(update, file.name), fs.file(path, file.name), true);
    })
}

/**
 * ZIP类型插件预加载
 * @param files
 */
function loadZipPlugin(files) {
    // // TODO ZIP类型插件加载
    // files.filter(function (file) {
    //     return file.name.endsWith(".zip");
    // }).forEach(function (file) {
    //     zip.unzip(fs.file(plugins_dir, file));
    //     var dir = new File(plugins_dir, file.name.split(".")[0]);
    //     // TODO 添加文件夹类型的插件兼容
    // });
}

/**
 * JS类型插件预加载
 */
function loadJsPlugin(files) {
    files.filter(function (file) {
        return file.name.endsWith(".js")
    }).forEach(function (file) {
        var p = require(file);
        if (!p.description || !p.description.name) {
            log.w("文件 %s 不存在 description 描述信息 无法加载插件!");
        } else {
            exports.plugins.push(p);
        }
    })
}

exports.$ = undefined;
exports.plugins = [];
exports.init = function (plugin, path) {
    if (plugin !== null) {
        // 如果过plugin不等于null 则代表是正式环境
        exports.$ = plugin;
        log.i("Init MiaoScript Engine Version: %s", plugin.description.version);
        require('./event');
    }
    loadPlugins(path);
};
exports.load = function () {
    exports.plugins.forEach(function (p) {
        p.load();
    })
};
exports.enable = function () {
    exports.plugins.forEach(function (p) {
        p.enable();
    })
};
exports.disable = function () {
    exports.plugins.forEach(function (p) {
        p.disable();
    })
};