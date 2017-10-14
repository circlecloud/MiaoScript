'use strict';
/**
 * MiaoScript脚本插件加载类
 */
/*global Java, base, module, exports, require, __FILE__*/
// var zip = require("core/zip");
var fs = require('core/fs');
var yaml = require('modules/yaml');
var event = require('modules/event');

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
        loadZipPlugins(files);
        loadJsPlugins(files);
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
            log.i('自动升级插件 %s', file);
            fs.move(file, fs.file(path, file.name), true);
        })
    }
}

/**
 * ZIP类型插件预加载
 * @param files
 */
function loadZipPlugins(files) {
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
function loadJsPlugins(files) {
    files.filter(function (file) {
        return file.name.endsWith(".js")
    }).forEach(function (file) {
        loadPlugin(file);
    })
}

function loadPlugin(file) {
    var p = require(file, {
        cache: false,
        // 给插件注入单独的 console
        hook: function (origin) {
            return 'var console = new Console();' + origin + 'module.exports.console = console;'
        }
    });
    log.d("插件编译结果: %s", p.toJson());
    if (!p.description || !p.description.name) {
        log.w("文件 %s 不存在 description 描述信息 无法加载插件!", file);
    } else {
        initPlugin(file, p);
        plugins.push(p);
        plugins[p.description.name] = p;
        log.i('载入插件 %s 版本 %s By %s', p.description.name, p.description.version || '未知', p.description.author || '未知');
    }
    return p;
}

/**
 * 初始化插件内容(提供config,__DATA__等参数)
 */
function initPlugin(file, plugin){
    // 初始化 __FILE__
    plugin.__FILE__ = file;
    // 初始化 __DATA__
    plugin.__DATA__ = fs.file(file.parentFile, plugin.description.name);
    // 初始化 getFile()
    plugin.getFile = function(name) {
        return fs.file(plugin.__DATA__, name);
    }
    // 给 console 添加插件名称
    plugin.console.name = plugin.description.name;
    // 初始化 getConfig()
    /**
     * 获取配置文件
     * @constructor
     * @constructor (file|string)
     */
    plugin.getConfig = function() {
        switch (arguments.length) {
            case 0:
                return plugin.config;
            case 1:
                var file = arguments[0];
                if (!file.isFile) {
                    file = plugin.getFile(file);
                }
                return yaml.safeLoad(base.read(file));
        }
    }
    // 初始化 saveConfig()
    /**
     * 保存配置文件
     * @constructor
     * @constructor (file, content)
     */
    plugin.saveConfig = function() {
        switch (arguments.length) {
            case 0:
                plugin.configFile.parentFile.mkdirs()
                base.save(plugin.configFile, plugin.config.toYaml());
            case 2:
                base.save(arguments[0], arguments[1].toYaml());
        }
    }
    // 初始化 getDataFolder()
    plugin.getDataFolder = function() {
        return plugin.__DATA__;
    }
    // 初始化 config
    plugin.configFile = plugin.getFile('config.yml');
    if (plugin.configFile.isFile()) {
        plugin.config = plugin.getConfig('config.yml');
    } else if ( plugin.description.config ){
        plugin.config = plugin.description.config;
        plugin.saveConfig();
    }
}

function runAndCatch(jsp, exec, ext) {
    if (exec) {
        try {
            // 绑定方法的this到插件自身
            exec.bind(jsp)();
            if (ext) {
                ext();
            }
        } catch (ex) {
            log.w('插件 %s 执行 %s 发生错误: %s', jsp.description.name, exec.name, ex.message);
            ex.printStackTrace();
        }
    }
}

function checkAndGet(args) {
    if (args.length === 0) {
        return plugins;
    }
    var name = args[0];
    // 如果是插件 则直接返回
    if (name.description) {
       return [name];
    }
    if (!exports.plugins[name]) {
        throw new Error("插件 " + name + "不存在!");
    }
    return [exports.plugins[name]];
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
    checkAndGet(arguments).forEach(function (p) runAndCatch(p, p.load));
};
exports.enable = function () {
    checkAndGet(arguments).forEach(function (p) runAndCatch(p, p.enable));
};
exports.disable = function () {
    checkAndGet(arguments).forEach(function (p) runAndCatch(p, p.disable, function () event.disable(p)));
};
exports.reload = function () {
    checkAndGet(arguments).forEach(function (p) {
        exports.disable(p);
        p = loadPlugin(p.__FILE__);
        exports.load(p);
        exports.enable(p);
    });
};