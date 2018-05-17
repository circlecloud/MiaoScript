'use strict';
/**
 * Sponge基础操作
 * Created by 蒋天蓓 on 2017/10/27 0009.
 */

/*global Java, base, module, exports, require, __FILE__*/
var Sponge = MServer;
var Server = MServer.server;
exports.$ = Sponge;
/**
 * 插件管理
 * @type {{manager: *, get: exports.plugin.get, load: exports.plugin.load}}
 */
var PluginManager = Sponge.pluginManager;
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
        return PluginManager.getPlugin(name).orElse(undefined);
    },
    /**
     * 载入插件 并且返回结果
     * @param name 插件名称
     * @returns {*}
     */
    load: function (name) {
        return PluginManager.isLoaded(name);
    },
    self: PluginManager.getPlugin('miaoscript').orElse(undefined)
};
/**
 * 服务管理
 * @type {{manager: *, get: exports.plugin.get, load: exports.plugin.load}}
 */
var ServicesManager = Sponge.serviceManager;
exports.service = {
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
exports.player = function () {
    switch (arguments.length) {
        case 0:
            return undefined;
        case 1:
            return Server.getPlayer(arguments[0]).orElse(undefined);
        default:
            return Server.getPlayer(arguments[0]).orElse(undefined);
    }
};
/**
 * 获取在线玩家
 */
exports.players = function () {
    switch (arguments.length) {
        case 1:
            // 此处的forEach是Collection接口的
            return Server.onlinePlayers.forEach(arguments[0]);
        default:
            // 此处会转换为JS原生的Array
            return Java.from(Server.onlinePlayers.toArray());
    }
};