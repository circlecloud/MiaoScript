'use strict';
/**
 * Sponge基础操作
 * Created by 蒋天蓓 on 2017/10/27 0009.
 */
/*global Java, base, module, exports, require, __FILE__*/
var Text = Java.type('org.spongepowered.api.text.Text');

var Sponge = MServer;
var Server = MServer.server;
/**
 * 插件管理
 * @type {{manager: *, get: exports.plugin.get, load: exports.plugin.load}}
 */
var PluginManager = Sponge.pluginManager;
var plugin = {
    /**
     * 插件管理工具
     */
    manager: PluginManager,
    /**
     * 获得插件实例
     * @param name 插件名称
     * @returns {*}
     */
    get: function (name) {
        return PluginManager.getPlugin(name).orElse(null);
    },
    /**
     * 载入插件 并且返回结果
     * @param name 插件名称
     * @returns {*}
     */
    load: function (name) {
        return PluginManager.isLoaded(name);
    },
    self: PluginManager.getPlugin('miaoscript').orElse(null)
};
/**
 * 服务管理
 * @type {{manager: *, get: exports.plugin.get, load: exports.plugin.load}}
 */
var ServicesManager = Sponge.serviceManager;
var service = {
    /*
     * 服务管理工具
     */
    manager: ServicesManager,
    /**
     * 获得服务实例
     * @param name 插件名称
     * @returns {*}
     */
    get: function (name) {
        return ServicesManager.provide(base.getClass(name)).orElse(null);
    }
};
/**
 * 获取玩家
 */
function player() {
    if (!arguments[0]) { throw TypeError("player name can't be null!") }
    return Server.getPlayer(arguments[0]).orElse(null);
};
/**
 * 获取在线玩家
 */
function onlinePlayers() {
    return Server.onlinePlayers;
};
/**
 * 公告
 * @param message 消息
 */
function broadcast(message) {
    Server.getBroadcastChannel().send(Text.of(message));
};
/**
 * 执行名称
 * @param player 玩家
 * @param command 命令
 */
function command(player, command) {
    Sponge.commandManager.process(player, command)
};
/**
 * 执行控制台命令
 * @param command 命令
 */
function console(command) {
    command(Server.console, command);
};
/**
 * 玩家以OP权限执行命令
 * @param player
 * @param command
 */
function opcommand(player, command) {
    var origin = player.isOp();
    player.setOp(true);
    try {
        command(player, command);
    } finally {
        player.setOp(origin);
    }
};
/**
 * 关闭引擎时执行的操作
 */
function shutdown() {
    Sponge.eventManager.unregisterPluginListeners(plugin.self);
    Sponge.scheduler.getScheduledTasks(plugin.self).forEach(function (task) { 
        task.cancel();
    });
    Sponge.commandManager.getOwnedBy(plugin.self).forEach(function (commandMapping) {
        Sponge.commandManager.removeMapping(commandMapping);
    });
}

exports = module.exports = {
    $: Sponge,
    plugin: plugin,
    service: service,
    player: player,
    onlinePlayers: onlinePlayers,
    broadcast: broadcast,
    command: command,
    console: console,
    opcommand: opcommand,
    shutdown: shutdown
}