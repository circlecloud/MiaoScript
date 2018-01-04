'use strict';
/**
 * MiaoScript脚本插件加载类
 */
/*global Java, base, module, exports, require, __FILE__*/
// var zip = require("core/zip");
var fs = require('core/fs');
var yaml = require('modules/yaml');
var event = require('./event');
var server = require('./server');
var command = require('./command');
var permission = require('./permission');

/**
 * 载入插件
 * @param dir
 */
function loadPlugins(dir) {
    var plugin = fs.file(root, dir);
    if (!plugin) {
        console.info("首次加载 创建文件夹 %s ...".format(plugin));
    } else {
        console.info("开始扫描 %s 下的插件 ...".format(plugin));
        createUpdate(plugin);
        var files = [];
        fs.list(plugin).forEach(function (file) {
            files.push(file.toFile());
        });
        fs.list(fs.file(plugin, DetectServerType)).forEach(function (file) {
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
function createUpdate(path) {
    var update = fs.file(path, "update");
    if (!update.exists()) {
        update.mkdirs();
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
        try {
            loadPlugin(file);
        } catch (ex) {
            console.console('§6插件 §b%s §6初始化时发生错误 §4%s'.format(fs.path(file), ex.message));
            console.ex(ex);
        }
    })
}

function loadPlugin(file) {
    var update = fs.file(fs.file(file.parentFile, 'update'), file.name);
    if (update.exists()) {
        console.info('自动升级插件 %s'.format(file.name));
        fs.move(update, file, true);
    }
    var plugin = require(file, {
        cache: false,
        hook: function (origin) {
            return beforeLoadHook(origin);
        }
    });
    console.debug("插件编译结果: %s".format(JSON.stringify(plugin)));
    var desc = plugin.description;
    if (!desc || !desc.name) {
        console.warn("文件 %s 不存在 description 描述信息 无法加载插件!".format(file));
    } else {
        initPlugin(file, plugin);
        afterLoadHook(plugin);
        plugins[plugin.description.name] = plugin;
        console.info('载入插件 %s 版本 %s By %s'.format(desc.name, desc.version || '未知', desc.author || '未知'));
    }
    return plugin;
}

function beforeLoadHook(origin) {
    var result = origin;
    // 处理 event 为了不影响 正常逻辑 event 还是手动require吧
    // result = result + 'var event = {}; module.exports.event = event;';
    // 注入 console 对象         // 给插件注入单独的 console
    result = result + 'var console = new Console(); module.exports.console = console;';
    // 插件注入 self 对象
    result = result + 'var self = {}; module.exports.self = self;';
    return result;
}

function afterLoadHook(plugin) {
    // plugin.event.on = event.on.bind(plugin);
    // 给 console 添加插件名称
    plugin.console.name = plugin.description.name;
    // 赋值 self
    Object.assign(plugin.self, plugin);
}

/**
 * 初始化插件内容(提供config,__DATA__等参数)
 */
function initPlugin(file, plugin) {
    // 初始化 __FILE__
    plugin.__FILE__ = file;
    // 初始化 __DATA__
    plugin.__DATA__ = fs.file(file.parentFile, plugin.description.name);
    // 初始化 getDataFolder()
    plugin.getDataFolder = function () {
        return plugin.__DATA__;
    };
    // 初始化 getFile()
    plugin.getFile = function (name) {
        return fs.file(plugin.getDataFolder(), name);
    };

    // 初始化插件配置相关方法
    initPluginConfig(plugin);

    if (command.enable) command.enable(plugin);
    if (permission.enable) permission.enable(plugin);
}

/**
 * 初始化插件配置
 */
function initPluginConfig(plugin) {
    // 初始化 config
    plugin.configFile = plugin.getFile('config.yml');
    /**
     * 获取配置文件
     * @constructor
     * @constructor (file|string)
     */
    plugin.getConfig = function () {
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
    };
    /**
     * 重载配置文件
     * @constructor
     * @constructor (file|string)
     */
    plugin.reloadConfig = function () {
        plugin.config = plugin.getConfig(plugin.configFile);
    };
    /**
     * 保存配置文件
     * @constructor
     * @constructor (file, content)
     */
    plugin.saveConfig = function () {
        switch (arguments.length) {
            case 0:
                plugin.configFile.parentFile.mkdirs();
                base.save(plugin.configFile, yaml.safeDump(plugin.config));
                break;
            case 2:
                base.save(arguments[0], yaml.safeDump(arguments[1]));
                break;
        }
    };
    if (plugin.configFile.isFile()) {
        plugin.config = plugin.getConfig('config.yml');
    } else if (plugin.description.config) {
        plugin.config = plugin.description.config;
        plugin.saveConfig();
    }
}

function runAndCatch(jsp, name, ext) {

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
        throw new Error("插件 " + name + " 不存在!");
    }
    return [exports.plugins[name]];
}

function checkAndRun(args, name, ext) {
    var pls = checkAndGet(args);
    for (var i in pls) {
        var jsp = pls[i];
        var exec = jsp[name];
        if (exec) {
            try {
                // 绑定方法的this到插件自身
                exec.bind(jsp)();
                if (ext) ext.bind(jsp)();
            } catch (ex) {
                console.console('§6插件 §b%s §6执行 §d%s §6方法时发生错误 §4%s'.format(jsp.description.name, name, ex.message));
                console.ex(ex);
            }
        }
    }
}

var plugins = [];

function init(path) {
    var plugin = exports.$
    if (plugin !== null) {
        // 如果过plugin不等于null 则代表是正式环境
        console.info("初始化 MiaoScript 插件系统: %s".format(plugin));
    }
    loadPlugins(path);
};

function load() {
    checkAndRun(arguments, 'init');
};

function enable() {
    checkAndRun(arguments, 'enable');
};

function disable() {
    checkAndRun(arguments, 'disable', function eventDisable() {
        event.disable(this);
    });
};

function reload() {
    checkAndRun(arguments, function (p) {
        disable(p);
        p = loadPlugin(p.__FILE__);
        load(p);
        enable(p);
    });
};

exports = module.exports = {
    $: server.plugin.self,
    plugins: plugins,
    init: init,
    load: load,
    enable: enable,
    disable: disable,
    reload: reload
}
