/**
 * 控制台输出类
 */
/*global base*/
(function (global) {
    var Arrays = Java.type('java.util.Arrays');
    var Level = Java.type('java.util.logging.Level');
    var String = Java.type('java.lang.String');
    var Console = function (name) {
        Object.defineProperty(this, 'name', {
            get: function () {
                return this._name;
            }.bind(this),
            set: function (name) {
                this._name = name ? '[' + name + '] ' : '';
                this.prefix = name ? '§6[§cMS§6][§b' + name + '§6]§r ' : '';
            }.bind(this)
        });
        this.name = name;
        this.log = function () {
            log.info(this.name + Array.prototype.join.call(arguments, ' '));
        };
        this.info = this.log;
        this.warn = function () {
            log.warning(this.name + Array.prototype.join.call(arguments, ' '));
        };
        this.error = function () {
            log.log(Level.SEVERE, this.name + Array.prototype.join.call(arguments, ' '));
        };
        switch (DetectServerType) {
            case ServerType.Bukkit:
                this.sender = function () {
                    var sender = arguments[0];
                    if (!(sender instanceof org.bukkit.command.CommandSender)) {
                        console.error("第一个参数未实现 org.bukkit.command.CommandSender 无法发送消息!")
                    }
                    var args = Array.prototype.slice.call(arguments, 1);
                    sender.sendMessage(this.prefix + args.join(' '));
                };
                this.console = function () {
                    this.sender(MServer.consoleSender, Array.prototype.join.call(arguments, ' '));
                };
                break;
            case ServerType.Sponge:
                this.sender = function () {
                    var Text = Java.type("org.spongepowered.api.text.Text");
                    var sender = arguments[0];
                    if (!(sender instanceof org.spongepowered.api.command.CommandSource)) {
                        console.error("第一个参数未实现 org.spongepowered.api.command.CommandSource 无法发送消息!")
                    }
                    var args = Array.prototype.slice.call(arguments, 1);
                    sender.sendMessage(Text.of(this.prefix + args.join(' ')));
                };
                this.console = function () {
                    this.sender(MServer.server.console, Array.prototype.join.call(arguments, ' '));
                };
                break;
            default:
                this.sender = function () {
                    throw Error("console.sender 不支持的服务器类型: " + DetectServerType);
                };
                this.console = function () {
                    throw Error("console.console 不支持的服务器类型: " + DetectServerType);
                };
        }
        this.debug = this.log;
        this.ex = function (ex) {
            this.console('§4' + ex);
            var track = ex.getStackTrace();
            if (track.class) {
                track = Arrays.asList(track)
            }
            track.forEach(function (stack) {
                if (stack.className.startsWith('<')) {
                    this.console('    §e位于 §c%s => §c%s §4行%s'.format(stack.fileName, stack.methodName, stack.lineNumber));
                } else {
                    this.console('    §e位于 §c%s.%s(§4%s:%s§c)'.format(stack.className, stack.methodName, stack.fileName, stack.lineNumber));
                }
            }.bind(this));
        }
    };
    global.Console = Console;
    global.console = new Console();
})(global);