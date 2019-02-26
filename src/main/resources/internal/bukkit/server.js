'use strict';
/**
 * Bukkit基础操作
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */

/*global Java, base, module, exports, require, __FILE__*/
var Bukkit = MServer;
/**
 * 获取NMS版本
 */
var nmsVersion = Bukkit.server.class.name.split('.')[3];
/**
 * 获取NMS类
 */
function nmsCls(name) {
    return Java.type(['net.minecraft.server', nmsVersion, name].join('.'));
};
/**
 * 获取OBC类
 */
function obcCls(name) {
    return Java.type(['org.bukkit.craftbukkit', nmsVersion, name].join('.'));
};
/**
 * 插件管理
 * @type {{manager: *, get: exports.plugin.get, load: exports.plugin.load}}
 */
var PluginManager = Bukkit.pluginManager;
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
        return PluginManager.getPlugin(name);
    },
    /**
     * 载入插件 并且返回结果
     * @param name 插件名称
     * @returns {*}
     */
    load: function (name) {
        var plugin = this.get(name);
        if (ext.notNull(plugin) && !plugin.isEnabled()) {
            PluginManager.enablePlugin(plugin);
        }
        return PluginManager.isPluginEnabled(name);
    },
    self: PluginManager.getPlugin('MiaoScript')
};
/**
 * 服务管理
 * @type {{manager: *, get: exports.plugin.get, load: exports.plugin.load}}
 */
var ServicesManager = Bukkit.servicesManager;
var service = {
    /**
     * 服务管理工具
     */
    manager: ServicesManager,
    /**
     * 获得服务实例
     * @param name 插件名称
     * @returns {*}
     */
    get: function (name) {
        var reg = ServicesManager.getRegistration(base.getClass(name));
        return reg && reg.provider || null;
    }
};
/**
 * 获取玩家
 */
function player() {
    if (!arguments[0]) { throw TypeError("player name can't be null!") }
    switch (arguments.length) {
        case 1:
            return Bukkit.getPlayer(arguments[0]);
        default:
            return Bukkit.getPlayerExtra(arguments[0]);
    }
};
/**
 * 获取在线玩家
 */
function onlinePlayers() {
    return Bukkit.onlinePlayers;
};
/**
 * 公告
 * @param message 消息
 */
function broadcast(message) {
    Bukkit.broadcastMessage(message);
};
/**
 * 执行名称
 * @param player 玩家
 * @param command 命令
 */
function command(player, command) {
    Bukkit.dispatchCommand(player, command);
};
/**
 * 执行控制台命令
 * @param command 命令
 */
function console(command) {
    command(Bukkit.consoleSender, command);
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
function shutdown () {
    Bukkit.scheduler.cancelTasks(plugin.self);
    Bukkit.servicesManager.unregisterAll(plugin.self);
    org.bukkit.event.HandlerList.unregisterAll(plugin.self);
    Bukkit.messenger.unregisterIncomingPluginChannel(plugin.self);
    Bukkit.messenger.unregisterOutgoingPluginChannel(plugin.self);
}

exports = module.exports = {
    $: Bukkit,
    nmsCls: nmsCls,
    obcCls: obcCls,
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