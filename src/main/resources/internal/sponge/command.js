'use strict';
/**
 * Sponge 命令相关类
 */

/*global Java, base, module, exports, require, __FILE__*/
var Sponge = MServer;
var server = require('./server');
var plugin = server.plugin.self;

var CommandManager = server.CommandManager;

var CommandSpec = Java.type('org.spongepowered.api.command.spec.CommandSpec');
var CommandCallable = Java.type('org.spongepowered.api.command.CommandCallable');
var CommandResult = Java.type('org.spongepowered.api.command.CommandResult');

var Text = Java.type('org.spongepowered.api.text.Text');

var Optional = Java.type('java.util.Optional');

var ArrayList = Java.type('java.util.ArrayList');
var Arrays = Java.type('java.util.Arrays');

var commandMap=[];

var SimpleCommandCallable = function (name) {
    var that = this;
    this.name = name;
    this.cmd = noop;
    this.tab = function() { return new ArrayList(); };
    this.callable = new CommandCallable({
        //CommandResult process(CommandSource source, String arguments) throws CommandException;
        process: function (src, args) {
            return that.cmd(src, null, name, args.split(" ")) ? CommandResult.success() : CommandResult.empty();
        },
        //List<String> getSuggestions(CommandSource source, String arguments, @Nullable  Location<World> targetPosition) throws CommandException;
        getSuggestions: function (src, args, target) {
            return that.tab(src, null, name, args.split(" "));
        },
        //boolean testPermission(CommandSource source);
        testPermission: function () {
            return true;
        },
        //Optional<Text> getShortDescription(CommandSource source);
        getShortDescription: function () {
            return Optional.of(Text.of(""));
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
}

function enable(jsp) {
    var pname = jsp.description.name;
    var commands = jsp.description.commands;
    if (commands) {
        var pluginCmds = [];
        for (var name in commands) {
            var command = commands[name];
            if (typeof command !== 'object') continue;
            create(jsp, name)
            console.debug('插件 %s 注册命令 %s ...'.format(jsp.description.name, name));
        }
    }
}

function get(name) {
}

function create(jsp, name) {
    var commandKey = jsp.description.name.toLowerCase() + ":" + name;
    if(!commandMap[commandKey]){
        commandMap[commandKey] = new SimpleCommandCallable();
        commandMap[commandKey].name = name;
        Sponge.getCommandManager().register(plugin, commandMap[commandKey].callable, name, commandKey);
    }
    return commandMap[commandKey];
}

function on(jsp, name, exec) {
    var c = create(jsp, name);
    console.debug('插件 %s 设置命令 %s 执行器 ...'.format(jsp.description.name, name));
    if (exec.cmd) {
        c.setExecutor(function (sender, cmd, command, args) {
            try {
                return exec.cmd(sender, command, args);
            } catch (ex) {
                console.log(args)
                console.console('§6玩家 §a%s §6执行 §b%s §6插件 §d%s %s §6命令时发生异常 §4%s'.format(sender.name, jsp.description.name, command, args, ex));
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
                console.console('§6玩家 §a%s §6执行 §b%s §6插件 §d%s %s §6补全时发生异常 §4%s'.format(sender.name, jsp.description.name, command, args, ex));
                console.ex(ex);
            }
        });
    }
}

var exist = Sponge.getCommandManager().getOwnedBy(plugin);
exist.forEach(function(commandMapping) { 
    if (!commandMapping.getAllAliases().contains("ms")) {
        Sponge.getCommandManager().removeMapping(commandMapping);
    }
});

exports = module.exports = {
    enable: enable,
    on: on,
    off: noop
}