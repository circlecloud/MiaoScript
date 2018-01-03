/*global Java, base, module, exports, require, __FILE__*/
(function (global) {
    global.Console = function BukkitConsole() {
        ConsoleDefault.call(this);
        this.sender = function () {
            var sender = arguments[0];
            if (!(sender instanceof org.bukkit.command.CommandSender)) {
                this.error("第一个参数未实现 org.bukkit.command.CommandSender 无法发送消息!")
            }
            var args = Array.prototype.slice.call(arguments, 1);
            sender.sendMessage(console.prefix + args.join(' '));
        };
        this.console = function () {
            this.sender(MServer.consoleSender, Array.prototype.join.call(arguments, ' '));
        };
    };
})(global);