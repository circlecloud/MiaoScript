package pw.yumc.MiaoScript.commands;

import org.bukkit.command.CommandSender;

import pw.yumc.MiaoScript.MiaoScript;
import pw.yumc.MiaoScript.event.EventInfo;
import pw.yumc.MiaoScript.event.EventManager;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.commands.CommandArgument;
import pw.yumc.YumCore.commands.CommandExecutor;
import pw.yumc.YumCore.commands.CommandManager;
import pw.yumc.YumCore.commands.annotation.Cmd;
import pw.yumc.YumCore.commands.annotation.Help;

public class MSCommands implements CommandExecutor {
    MiaoScript plugin = P.getPlugin();

    public MSCommands() {
        new CommandManager("ms", this);
    }

    @Cmd(permission = "MiaoScript.debug")
    @Help("切换调试模式")
    public void debug(final CommandArgument e) {
        EventManager.debug = !EventManager.debug;
        e.getSender().sendMessage("§6调试模式: " + (EventManager.debug ? "§a开启" : "§c关闭"));
    }

    @Cmd(permission = "MiaoScript.listen")
    @Help("查看监听列表")
    public void listen(final CommandArgument e) {
        final CommandSender sender = e.getSender();
        for (final EventInfo ei : plugin.getEventManager().getEvents().values()) {
            sender.sendMessage(String.format("§6名称: §a%s §6事件: §a%s §6优先级: §a%s", ei.getName(), ei.getClazz().substring(ei.getClazz().lastIndexOf(".") + 1), ei.getPriority()));
            sender.sendMessage("§6脚本列表: ");
            for (final String script : ei.getScripts()) {
                sender.sendMessage(String.format("§6- §e%s", script));
            }
        }
    }

    @Cmd(permission = "MiaoScript.reload")
    @Help("重载配置文件")
    public void reload(final CommandArgument e) {
        plugin.reload();
        e.getSender().sendMessage("§a配置文件已重新载入!");
    }
}
