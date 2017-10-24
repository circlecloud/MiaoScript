/**
 * 控制台输出类
 */
/*global base*/
(function(global){
    var Arrays = Java.type('java.util.Arrays');
    var Level = Java.type('java.util.logging.Level');
    var Console = function (name) {
        Object.defineProperty(this, 'name', {
            get: function () {
                return this._name;
            }.bind(this),
            set: function (name) {
                this._name = name ? '[' + name + '] ' : '';
                this.prefix = name ? '§6[§b' + name + '§6]§r ' : '';
            }.bind(this)
        });
        this.name = name;
        this.log = function () {
            log.i(this.name + Array.prototype.join.call(arguments, ' '));
        },
        this.warn = function () {
            log.w(this.name + Array.prototype.join.call(arguments, ' '));
        },
        this.error = function () {
            log.log(Level.SEVERE, this.name + Array.prototype.join.call(arguments, ' '));
        },
        this.debug = function () {
            log.d(this.name + Array.prototype.join.call(arguments, ' '));
        }
        this.sender = function () {
            var sender = arguments[0];
            if (!(sender instanceof org.bukkit.command.CommandSender)) { console.error("第一个参数未实现 org.bukkit.command.CommandSender 无法发送消息!") }
            var args = Array.prototype.slice.call(arguments, 1);
            sender.sendMessage(this.prefix + args.join(' '));
        }
        this.ex = function (ex) {
            log.console('§4' + ex);
            var track = ex.getStackTrace();
            if (track.class) { track = Arrays.asList(track) }
            if (track.forEach) {
                track.forEach(function (stack) {
                    if (stack.className.startsWith('<')) {
                        log.console('    §e位于 §c%s => §c%s §4行%s', stack.fileName, stack.methodName, stack.lineNumber);
                    } else {
                        log.console('    §e位于 §c%s.%s(§4%s:%s§c)', stack.className, stack.methodName, stack.fileName, stack.lineNumber);
                    }
                });
            }
        }
    }
    global.Console = Console;
    global.console = new Console();
})(global)