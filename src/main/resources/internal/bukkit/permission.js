'use strict';
/**
 * Bukkit 权限相关类
 */

/*global Java, base, module, exports, require, __FILE__*/
var manager = require('./server').plugin.manager;

/**
 * Permission(String name, String description)
 */
var Permission = Java.type("org.bukkit.permissions.Permission");
var PermissionDefault = Java.type('org.bukkit.permissions.PermissionDefault');

function enable(plugin) {
    var permissions = plugin.description.permissions;
    if (permissions) {
        for (var name in permissions) {
            // noinspection JSUnfilteredForInLoop
            var permission = permissions[name];
            if (typeof permission !== 'object') continue;
            var desc = permission.description;
            var def = permission.default || 'OP';
            try {
                // noinspection JSUnfilteredForInLoop
                manager.addPermission(new Permission(name, desc, PermissionDefault.getByName(def)));
            } catch (ex) {
                // ignore eg: java.lang.IllegalArgumentException: The permission xxxxxx.default is already defined!
            }
            // noinspection JSUnfilteredForInLoop
            console.debug('插件 %s 注册权限 %s Default %s ...'.format(plugin.description.name, name, def));
        }
    }
}

function disable(plugin) {
    var permissions = plugin.description.permissions;
    if (permissions) {
        for (var name in permissions) {
            try {
                // noinspection JSUnfilteredForInLoop
                manager.removePermission(name);
            } catch (ex) {
                // ignore eg: java.lang.IllegalArgumentException: The permission xxxxxx.default is already defined!
            }
            // noinspection JSUnfilteredForInLoop
            console.debug('插件 %s 注销权限 %s ...'.format(plugin.description.name, name));
        }
    }
}

exports.enable = enable;
exports.disable = disable;