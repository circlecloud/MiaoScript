'use strict';
/**
 * Sponge基础操作
 * Created by 蒋天蓓 on 2017/10/27 0009.
 */

/*global Java, base, module, exports, require, __FILE__*/
var Sponge = MServer;
// noinspection JSUnresolvedVariable
var Server = Sponge.server;
var PluginManager = Sponge.pluginManager;
exports.$ = Sponge;
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
    },
    self: PluginManager.getPlugin('miaoscript').get()
};