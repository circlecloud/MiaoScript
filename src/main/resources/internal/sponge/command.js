'use strict';
/**
 * Sponge 命令相关类
 */

/*global Java, base, module, exports, require, __FILE__*/
var Sponge = MServer;
var server = require('./server');
var plugin = server.plugin.self;

var CommandCallable = Java.type('org.spongepowered.api.command.CommandCallable');
var CommandResult = Java.type('org.spongepowered.api.command.CommandResult');

var Text = Java.type('org.spongepowered.api.text.Text');

var Optional = Java.type('java.util.Optional');

var ArrayList = Java.type('java.util.ArrayList');
var Arrays = Java.type('java.util.Arrays');

var commandMap = [];

var SimpleCommandCallable = function (command) {
    var that = this;
    this.name = command.name;
    this.cmd = noop;
    this.tab = function () {
        return new ArrayList();
    };
    // noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    this.callable = new CommandCallable({
        //CommandResult process(CommandSource source, String arguments) throws CommandException;
        process: function (src, args) {
            return that.cmd(src, that.name, args.length === 0 ? [] : args.split(" ").filter(function (e) { return e; })) ? CommandResult.success() : CommandResult.empty();
        },
        //List<String> getSuggestions(CommandSource source, String arguments, @Nullable  Location<World> targetPosition) throws CommandException;
        getSuggestions: function (src, args, target) {
            return that.tab(src, that.name, args.length === 0 ? [] : args.split(" ").filter(function (e) { return e; }));
        },
        //boolean testPermission(CommandSource source);
        testPermission: function () {
            return true;
        },
        //Optional<Text> getShortDescription(CommandSource source);
        getShortDescription: function () {
            return Optional.of(Text.of(command.description || '暂无描述!'));
        },
        //Optional<Text> getHelp(CommandSource source);
        getHelp: function () {
            return Optional.of(Text.of(""));
        },
        //Text getUsage(CommandSource source);
        getUsage: function () {
            return Text.of('');
        }
    });
    this.setExecutor = function (exec) {
        that.cmd = exec;
    };
    this.setTabCompleter = function (exec) {
        that.tab = exec;
    }
};

function enable(jsp) {
    // noinspection JSUnusedLocalSymbols
    var plugin = jsp.description.name;
    var commands = jsp.description.commands;
    if (commands) {
        // noinspection JSUnusedLocalSymbols
        var pluginCommands = [];
        for (var name in commands) {
            var command = commands[name];
            if (typeof command !== 'object') continue;
            command.name = name;
            create(jsp, command);
            console.debug('插件 %s 注册命令 %s ...'.format(jsp.description.name, name));
        }
    }
}

// noinspection JSUnusedLocalSymbols
function get(name) {
}

function create(jsp, command) {
    var commandKey = jsp.description.name.toLowerCase() + ":" + command.name;
    if (!commandMap[commandKey]) {
        commandMap[commandKey] = new SimpleCommandCallable(command);
        Sponge.getCommandManager().register(plugin, commandMap[commandKey].callable, command.name, commandKey);
    }
    return commandMap[commandKey];
}

function on(jsp, name, exec) {
    var c = create(jsp, {name: name});
    console.debug('插件 %s 设置命令 %s 执行器 ...'.format(jsp.description.name, name));
    if (exec.cmd) {
        c.setExecutor(function execCmd(sender, command, args) {
            try {
                return exec.cmd(sender, command, args);
            } catch (ex) {
                console.console('§6玩家 §a%s §6执行 §b%s §6插件 §d%s %s §6命令时发生异常'
                    .format(sender.name, jsp.description.name, command, args.join(' ')));
                console.ex(ex);
            }
        });
    }
    if (exec.tab) {
        c.setTabCompleter(function execTab(sender, command, args) {
            try {
                var token = args[args.length - 1];
                var complete = exec.tab(sender, command, args) || [];
                return Arrays.asList(complete.copyPartialMatches(token, []));
            } catch (ex) {
                console.console('§6玩家 §a%s §6执行 §b%s §6插件 §d%s %s §6补全时发生异常'
                    .format(sender.name, jsp.description.name, command, args.join(' ')));
                console.ex(ex);
            }
        });
    }
}

exports = module.exports = {
    enable: enable,
    on: on,
    off: noop
};