/**
 * 控制台输出类
 */
/*global base*/
(function (global) {
    var Arrays = Java.type('java.util.Arrays');
    var Level = Java.type('java.util.logging.Level');
    var Console = {
        createNew: function (name) {
            var console = {};
            Object.defineProperty(console, 'name', {
                get: function () {
                    return this._name;
                }.bind(console),
                set: function (name) {
                    this._name = name ? '[' + name + '] ' : '';
                    this.prefix = name ? '§6[§cMS§6][§b' + name + '§6]§r ' : '§6[§bMiaoScript§6]§r ';
                }.bind(console)
            });
            console.name = name;
            console.log = console.info = function () {
                log.info(this.name + Array.prototype.join.call(arguments, ' '));
            };
            console.warn = function () {
                log.warning(this.name + Array.prototype.join.call(arguments, ' '));
            };
            console.error = function () {
                log.log(Level.SEVERE, this.name + Array.prototype.join.call(arguments, ' '));
            };
            console.debug = function () {
                log.info(this.name + '[DEBUG] ' + Array.prototype.join.call(arguments, ' '));
            };
            console.debug = global.debug ? console.debug : global.noop;
            console.sender = console.info;
            console.console = console.info;
            console.object = function (obj) {
                for (var i in obj) {
                    console.log(i, '=>', obj[i])
                }
            }
            console.ex = function (message, ex) {
                if (!ex) {
                    this.console('§4' + message);
                    ex = message;
                } else {
                    this.console('§4' + message + ' ' + ex);
                }
                var track = ex.getStackTrace();
                if (track.class) {
                    track = Arrays.asList(track)
                }
                track.forEach(function (stack) {
                    if (stack.className.startsWith('<')) {
                        this.console('    §e位于§c', stack.fileName, '=>§c', stack.methodName, '§4行', stack.lineNumber);
                    } else {// %s.%s(§4%s:%s§c)
                        this.console('    §e位于§c', stack.className + '.' + stack.methodName + '(§4' + stack.fileName + ':' + stack.lineNumber + '§c)');
                    }
                }.bind(this));
            };
            return console;
        }
    };
    var BukkitConsole = {
        createNew: function () {
            var console = Console.createNew();
            console.sender = function () {
                var sender = arguments[0];
                if (!(sender instanceof org.bukkit.command.CommandSender)) {
                    this.error("第一个参数未实现 org.bukkit.command.CommandSender 无法发送消息!")
                }
                var args = Array.prototype.slice.call(arguments, 1);
                sender.sendMessage(console.prefix + args.join(' '));
            };
            console.console = function () {
                this.sender(MServer.consoleSender, Array.prototype.join.call(arguments, ' '));
            };
            return console;
        }
    };
    var SpongeConsole = {
        createNew: function () {
            var console = Console.createNew();
            console.sender = function () {
                var Text = Java.type("org.spongepowered.api.text.Text");
                var sender = arguments[0];
                if (!(sender instanceof org.spongepowered.api.command.CommandSource)) {
                    this.error("第一个参数未实现 org.spongepowered.api.command.CommandSource 无法发送消息!")
                }
                var args = Array.prototype.slice.call(arguments, 1);
                sender.sendMessage(Text.of(console.prefix + args.join(' ')));
            };
            console.console = function () {
                this.sender(MServer.server.console, Array.prototype.join.call(arguments, ' '));
            };
            console.warn = function () {
                log.warn(this.name + Array.prototype.join.call(arguments, ' '));
            };
            return console;
        }
    };
    switch (DetectServerType) {
        case ServerType.Bukkit:
            global.Console = BukkitConsole;
            break;
        case ServerType.Sponge:
            global.Console = SpongeConsole;
            break;
        default:
            global.Console = Console;
            break;
    }
    global.console = global.Console.createNew();
})(global);