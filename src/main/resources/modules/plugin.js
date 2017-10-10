'use strict';
/**
 * MiaoScript脚本插件加载类
 */
/*global Java, base, module, exports, require, __FILE__*/
// var zip = require("core/zip");
var fs = require('core/fs');

/**
 * 载入插件
 * @param path
 */
function loadPlugins(path) {
    var plugin = fs.file(path);
    if (!plugin) {
        log.i("首次加载 创建文件夹 %s ...", path);
    } else {
        log.i("开始扫描 %s 下的插件 ...", path);
        updatePlugins(path);
        var files = [];
        fs.list(path).forEach(function (file) {
            files.push(file.toFile());
        });
        loadZipPlugin(files);
        loadJsPlugin(files);
    }
}

/**
 * 更新插件
 * @param path
 */
function updatePlugins(path) {
    var update = fs.file(path, "update");
    if (!update.exists()) {
        update.mkdirs();
    } else {
        fs.list(update).forEach(function (file) {
            fs.move(fs.file(update, file.name), fs.file(path, file.name), true);
        })
    }
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
        log.d("插件编译结果: %s", JSON.stringify(p));
        if (!p.description || !p.description.name) {
            log.w("文件 %s 不存在 description 描述信息 无法加载插件!", file);
        } else {
            plugins.push(p);
            plugins[p.description.name] = p;
            log.i('插件 %s 版本 %s 加载成功!', p.description.name, p.description.version);
        }
    })
}

function runAndCatch(name, exec) {
    if (exec) {
        try {
            exec();
        } catch (ex) {
            log.w('插件 %s 执行 %s 发生错误: %s', name, exec.name, ex.message);
            ex.printStackTrace();
        }
    }
}

function checkAndGet(name) {
    if (!exports.plugins[name]) {
        throw new Error("插件 " + name + "不存在!");
    }
    return exports.plugins[name];
}

var plugins = [];

exports.$ = undefined;
exports.plugins = plugins;
exports.init = function (plugin, path) {
    if (plugin !== null) {
        // 如果过plugin不等于null 则代表是正式环境
        exports.$ = plugin;
        log.i("初始化 MiaoScript 插件系统 版本: %s", plugin.description.version);
    }
    loadPlugins(path);
};
exports.load = function () {
    if (arguments.length === 0) {
        plugins.forEach(function (p) {
            runAndCatch(p.description.name, p.load);
        })
    } else {
        var p = checkAndGet(arguments[0]);
        runAndCatch(p.description.name, p.load);
    }
};
exports.enable = function () {
    if (arguments.length === 0) {
        plugins.forEach(function (p) {
            runAndCatch(p.description.name, p.enable);
        })
    } else {
        var p = checkAndGet(arguments[0]);
        runAndCatch(p.description.name, p.enable);
    }
};
exports.disable = function () {
    if (arguments.length === 0) {
        plugins.forEach(function (p) {
            runAndCatch(p.description.name, p.disable);
        })
    } else {
        var p = checkAndGet(arguments[0]);
        runAndCatch(p.description.name, p.disable);
    }
};