'use strict';
/**
 * Sponge 命令相关类
 */

/*global Java, base, module, exports, require, __FILE__*/
var server = require('./server');
var plugin = server.plugin.self;

var CommandManager = server.CommandManager;

var CommandSpec = Java.type('org.spongepowered.api.command.spec.CommandSpec');
var CommandCallable = Java.type('org.spongepowered.api.command.CommandCallable');

var Text = Java.type('org.spongepowered.api.text.Text');

var Optional = Java.type('java.util.Optional');

var ArrayList = Java.type('java.util.ArrayList');
var Arrays = Java.type('java.util.Arrays');

var SimpleCommandCallable = function () {
    this.process = function (source, args) {

    };
    this.getSuggestions = function (source, args, targetPosition) {
        return Arrays.asList('');
    };
    this.testPermission = function (source) {
        return true;
    };
    this.getShortDescription = function (source) {
        return Optional.ofNullable('');
    };
    this.getHelp = function (source) {

    }
};

function enable(jsp) {
    var commands = jsp.description.commands;
    if (commands) {
        var pluginCmds = [];
        for (var name in commands) {
            var command = commands[name];
            if (typeof command !== 'object') continue;
            var newCmd = CommandSpec.builder();
            if (command.description) newCmd.description(Text.of(command.description));
            // if (command.usage) newCmd.setUsage(command.usage);
            if (command.aliases) newCmd.setAliases(Arrays.asList(command.aliases));
            if (command.permission) newCmd.setPermission(command.permission);
            if (command['permission-message']) newCmd.setPermissionMessage(command['permission-message']);
            pluginCmds.push(newCmd);
            console.debug('插件 %s 注册命令 %s ...'.format(jsp.description.name, name));
        }
        commandMap.registerAll(jsp.description.name, Arrays.asList(pluginCmds));
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
    console.debug('插件 %s 设置命令 %s(%s) 执行器 ...'.format(jsp.description.name, name, c));
    if (exec.cmd) {
        c.setExecutor(function (sender, cmd, command, args) {
            try {
                return exec.cmd(sender, command, args);
            } catch (ex) {
                console.console('§6玩家 §a%s §6执行 §b%s §6插件 §d%s %s §6命令时发生异常 §4%s'.format(sender.name, jsp.description.name, command, Java.from(args).join(' '), ex));
                console.ex(ex);
            }
        });
    }
    if (exec.tab) {
        c.setTabCompleter(function (sender, cmd, command, args) {
            try {
                var completions = new ArrayList();
                var token = args[args.length - 1];
                StringUtil.copyPartialMatches(token, Arrays.asList(exec.tab(sender, command, args)), completions);
                return completions;
            } catch (ex) {
                console.console('§6玩家 §a%s §6执行 §b%s §6插件 §d%s %s §6补全时发生异常 §4%s'.format(sender.name, jsp.description.name, command, Java.from(args).join(' '), ex));
                console.ex(ex);
            }
        });
    }
}

exports.enable = enable;

exports.on = on;
exports.off = function () {

};