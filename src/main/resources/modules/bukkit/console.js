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
}
global.Console = BukkitConsole;
exports = global.Console;