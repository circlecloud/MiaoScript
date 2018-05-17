'use strict';
/**
 * Bukkit 命令相关类
 */

/*global Java, base, module, exports, require, __FILE__*/
var ref = require('modules/reflect');
var bukkit = require('./server');
var plugin = bukkit.plugin.self;
var commandMap = ref.on(bukkit.plugin.manager).get('commandMap').get();
var PluginCommand = Java.type('org.bukkit.command.PluginCommand');

var Arrays = Java.type('java.util.Arrays');

function enable(jsp) {
    var commands = jsp.description.commands;
    if (commands) {
        var pluginCommands = [];
        for (var name in commands) {
            // noinspection JSUnfilteredForInLoop
            var command = commands[name];
            if (typeof command !== 'object') continue;
            // noinspection JSUnfilteredForInLoop
            var newCmd = create(jsp, name);
            if (command.description) newCmd.setDescription(command.description);
            if (command.usage) newCmd.setUsage(command.usage);
            /** @namespace command.aliases */
            if (command.aliases) newCmd.setAliases(Arrays.asList(command.aliases));
            if (command.permission) newCmd.setPermission(command.permission);
            if (command['permission-message']) newCmd.setPermissionMessage(command['permission-message']);
            pluginCommands.push(newCmd);
            // noinspection JSUnfilteredForInLoop
            console.debug('插件 %s 注册命令 %s ...'.format(jsp.description.name, name));
        }
        commandMap.registerAll(jsp.description.name, Arrays.asList(pluginCommands));
    }
}

// noinspection JSUnusedLocalSymbols
function disable(jsp) {
    var commands = jsp.description.commands;
    if (commands) {
        // noinspection JSUnusedLocalSymbols
        for (var name in commands) {
            //TODO 删除插件命令
        }
    }
}

function get(name) {
    return commandMap.getCommand(name);
}

function create(jsp, name) {
    return register(jsp, ref.on(PluginCommand).create(name, plugin).get());
}

function register(jsp, cmd) {
    commandMap.register(jsp.description.name, cmd);
    return cmd;
}

function on(jsp, name, exec) {
    var c = get(name) || create(jsp, name);
    console.debug('插件 %s 设置命令 %s(%s) 执行器 ...'.format(jsp.description.name, name, c));
    if (exec.cmd) {
        // 必须指定需要实现的接口类型 否则MOD服会报错
        // noinspection JSUnusedGlobalSymbols
        c.setExecutor(new org.bukkit.command.CommandExecutor({
            onCommand: function (sender, cmd, command, args) {
                try {
                    return exec.cmd(sender, command, args);
                } catch (ex) {
                    console.console('§6玩家 §a%s §6执行 §b%s §6插件 §d%s %s §6命令时发生异常 §4%s'
                        .format(sender.name, jsp.description.name, command, Java.from(args).join(' '), ex));
                    console.ex(ex);
                }
            }
        }));
    }
    if (exec.tab) {
        // 必须指定需要实现的接口类型 否则MOD服会报错
        // noinspection JSUnusedGlobalSymbols
        c.setTabCompleter(new org.bukkit.command.TabCompleter({
            onTabComplete: function (sender, cmd, command, args) {
                try {
                    var token = args[args.length - 1];
                    var complete = exec.tab(sender, command, args) || [];
                    return Arrays.asList(complete.copyPartialMatches(token, []));
                } catch (ex) {
                    console.console('§6玩家 §a%s §6执行 §b%s §6插件 §d%s %s §6补全时发生异常 §4%s'
                        .format(sender.name, jsp.description.name, command, Java.from(args).join(' '), ex));
                    console.ex(ex);
                }
            }
        }));
    }
}

exports.enable = enable;

exports.on = on;
exports.off = function () {

};