'use strict';
/**
 * Bukkit 命令相关类
 */

/*global Java, base, module, exports, require, __FILE__*/
var plugin = base.plugin;
var ref = require('core/reflect');
var bukkit = require('./bukkit');
var commandMap = ref.on(bukkit.plugin.manager).get('commandMap').get();
var PluginCommand = Java.type('org.bukkit.command.PluginCommand');

var Arrays = Java.type('java.util.Arrays')

function enable(jsp){
    var commands = jsp.description.commands;
    if(commands){
        var pluginCmds = [];
        for (var name in commands){
            var command = commands[name];
            if (typeof command !== 'object') continue;
            var newCmd = create(jsp, name);
            if (command.description) newCmd.setDescription(command.description);
            if (command.usage) newCmd.setUsage(command.usage);
            if (command.aliases) newCmd.setAliases(Arrays.asList(command.aliases));
            if (command.permission) newCmd.setPermission(command.permission);
            if (command['permission-message']) newCmd.setPermissionMessage(command['permission-message']);
            pluginCmds.push(newCmd);
            log.d('插件 %s 注册命令 %s ...', jsp.description.name, name);
        }
        commandMap.registerAll(jsp.description.name, Arrays.asList(pluginCmds));
    }
}

function get(name) {
    return commandMap.getCommand(name);
}

function create(jsp, name) {
    return ref.on(PluginCommand).create(name, plugin).get();
}

function register(jsp, cmd){
    commandMap.register(jsp.description.name, cmd);
}

// var exec = {
//     cmd: function (sender, command, args) {
//
//     },
//     tab: function (sender, command, args) {
//
//     }
// };
function on(jsp, name, exec) {
    var c = get(name) || create(jsp, name);
    if (exec.cmd) {
        c.setExecutor(function (sender, cmd, command, args) {
            return exec.cmd(sender, command, args);
        });
    }
    if (exec.tab) {
        c.setTabCompleter(function (sender, cmd, command, args) {
            return Arrays.asList(exec.tab(sender, command, args));
        });
    }
}

exports.enable = enable

exports.on = on;
exports.off = function () {

};