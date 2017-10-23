'use strict';
/**
 * MiaoScript脚本插件加载类
 */
/*global Java, base, module, exports, require, __FILE__*/
// var zip = require("core/zip");
var fs = require('core/fs');
var yaml = require('modules/yaml');
var event = require('modules/event');
var bukkit = require('./bukkit');
var command = require('./command');
var permission = require('./permission');

/**
 * 载入插件
 * @param path
 */
function loadPlugins(dir) {
    var plugin = fs.file(root, dir);
    if (!plugin) {
        log.i("首次加载 创建文件夹 %s ...", plugin);
    } else {
        log.i("开始扫描 %s 下的插件 ...", plugin);
        createUpdate(plugin);
        var files = [];
        fs.list(plugin).forEach(function (file) {
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
        loadPlugin(file);
    })
}

function loadPlugin(file) {
    var update = fs.file(fs.file(file.parentFile, 'update'), file.name);
    if (update.exists()) {
        log.i('自动升级插件 %s', file.name);
        fs.move(update, file, true);        
    }
    var plugin = require(file, {
        cache: false,
        hook: function (origin) {
            return beforeLoadHook(origin);
        }
    });
    log.d("插件编译结果: %s", plugin.toJson());
    var desc = plugin.description;
    if (!desc || !desc.name) {
        log.w("文件 %s 不存在 description 描述信息 无法加载插件!", file);
    } else {
        initPlugin(file, plugin);
        afterLoadHook(plugin);
        plugins.push(plugin);
        plugins[plugin.description.name] = plugin;
        log.i('载入插件 %s 版本 %s By %s', desc.name, desc.version || '未知', desc.author || '未知');
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
    for (var i in plugin){
        plugin.self[i] = plugin[i];
    }
}

/**
 * 初始化插件内容(提供config,__DATA__等参数)
 */
function initPlugin(file, plugin){
    // 初始化 __FILE__
    plugin.__FILE__ = file;
    // 初始化 __DATA__
    plugin.__DATA__ = fs.file(file.parentFile, plugin.description.name);
    // 初始化 getDataFolder()
    plugin.getDataFolder = function() { return plugin.__DATA__; }
    // 初始化 getFile()
    plugin.getFile = function(name) { return fs.file(plugin.getDataFolder(), name); }

    // 初始化插件配置相关方法
    initPluginConfig(plugin);

    command.enable(plugin);
    permission.enable(plugin);
}

/**
 * 初始化插件配置
 */
function initPluginConfig(plugin){
    // 初始化 config
    plugin.configFile = plugin.getFile('config.yml');
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
    /**
     * 重载配置文件
     * @constructor
     * @constructor (file|string)
     */
    plugin.reloadConfig = function() {
        plugin.config = plugin.getConfig(plugin.configFile);
    }
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
                break;
            case 2:
                base.save(arguments[0], arguments[1].toYaml());
                break;
        }
    }
    if (plugin.configFile.isFile()) {
        plugin.config = plugin.getConfig('config.yml');
    } else if (plugin.description.config ){
        plugin.config = plugin.description.config;
        plugin.saveConfig();
    }
}

function runAndCatch(jsp, exec, ext) {
    if (exec) {
        try {
            // 绑定方法的this到插件自身
            exec.bind(jsp)();
            if (ext) { ext(); }
        } catch (ex) {
            log.console('§6插件 §b%s §6执行 §d%s §6方法时发生错误 §4%s', jsp.description.name, exec.name, ex.message);
            console.ex(ex);
        }
    }
}

function checkAndGet(args) {
    if (args.length === 0) { return plugins; }
    var name = args[0];
    // 如果是插件 则直接返回
    if (name.description) { return [name]; }
    if (!exports.plugins[name]) { throw new Error("插件 " + name + " 不存在!"); }
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
    checkAndGet(arguments).forEach(function (p) runAndCatch(p, p.disable, function(){
        event.disable(p);
        // task.cancel();
    }));
};
exports.reload = function () {
    checkAndGet(arguments).forEach(function (p) {
        exports.disable(p);
        p = loadPlugin(p.__FILE__);
        exports.load(p);
        exports.enable(p);
    });
};