'use strict';
/**
 * Bukkit基础操作
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */

/*global Java, base, module, exports, require, __FILE__*/
var Bukkit = Java.type("org.bukkit.Bukkit");
var PluginManager = Bukkit.pluginManager;

exports.plugin = {
    manager: PluginManager,
    get: function (name) {
        return PluginManager.getPlugin(name);
    },
    load: function (name) {
        var plugin = this.get(name);
        if (ext.notNull(plugin) && !plugin.isEnabled()) {
            PluginManager.enablePlugin(plugin);
        }
        return PluginManager.isPluginEnabled(name);
    }
};
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