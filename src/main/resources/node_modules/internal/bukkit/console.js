/*global Java, base, module, exports, require, __FILE__*/
(function(global) {
    global.Console = function BukkitConsole() {
        ConsoleDefault.call(this);
        this.sender = function() {
            var sender = arguments[0];
            if (!(sender instanceof org.bukkit.command.CommandSender)) {
                this.error("第一个参数未实现 org.bukkit.command.CommandSender 无法发送消息!")
                return;
            }
            if (toString.call(arguments[1]) === "[object Array]") {
                arguments[1].forEach(function(line) {
                    sender.sendMessage(this.prefix + line);
                }.bind(this))
            } else {
                var args = Array.prototype.slice.call(arguments, 1);
                sender.sendMessage(this.prefix + args.join(' '));
            }
        }.bind(this);
        this.console = function() {
            this.sender(MServer.consoleSender, Array.prototype.join.call(arguments, ' '));
        }.bind(this);
    };
})(global);