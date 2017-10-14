'use strict';
/**
 * Bukkit基础操作
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */

/*global Java, base, module, exports, require, __FILE__*/
var Bukkit = Java.type("org.bukkit.Bukkit");
// noinspection JSUnresolvedVariable
var PluginManager = Bukkit.pluginManager;
exports.$ = Bukkit;
/**
 * 获取NMS版本
 */
exports.nmsVersion = Bukkit.server.class.name.split('.')[3];
/**
 * 获取NMS类
 */
exports.nmsCls = function (name) {
    return Java.type(['net.minecraft.server', exports.nmsVersion, name].join('.'));
}
/**
 * 获取在线玩家
 */
exports.players = function (func) {
    return Bukkit.onlinePlayers.forEach(func);
};
/**
 * 插件管理
 * @type {{manager: *, get: exports.plugin.get, load: exports.plugin.load}}
 */
exports.plugin = {
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
    }
};
/**
 * 公告
 * @param message 消息
 */
exports.broadcast = function (message) {
    Bukkit.broadcastMessage(message);
};
/**
 * 执行名称
 * @param player 玩家
 * @param command 命令
 */
exports.command = function (player, command) {
    Bukkit.dispatchCommand(player, command);
};
/**
 * 执行控制台命令
 * @param command 命令
 */
exports.console = function (command) {
    exports.command(Bukkit.getConsoleSender(), command);
};
/**
 * 玩家以OP权限执行命令
 * @param player
 * @param exper
 */
exports.opcommand = function (player, exper) {
    var origin = player.isOp();
    player.setOp(true);
    try {
        exports.command(player, exper);
    } finally {
        player.setOp(origin);
    }
};