package pw.yumc.MiaoScript.commands;

import javax.script.ScriptException;

import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import me.clip.placeholderapi.PlaceholderAPI;
import pw.yumc.MiaoScript.MiaoScript;
import pw.yumc.MiaoScript.event.EventInfo;
import pw.yumc.MiaoScript.javascript.MiaoScriptEngine;
import pw.yumc.MiaoScript.misc.MLog;
import pw.yumc.MiaoScript.script.ScriptInfo;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.commands.CommandArgument;
import pw.yumc.YumCore.commands.CommandExecutor;
import pw.yumc.YumCore.commands.CommandManager;
import pw.yumc.YumCore.commands.annotation.Cmd;
import pw.yumc.YumCore.commands.annotation.Help;

/**
 * 喵式脚本命令
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:50:58
 */
public class MSCommands implements CommandExecutor {
    private final MiaoScript plugin = P.getPlugin();

    public MSCommands() {
        new CommandManager("ms", this);
    }

    @Cmd(permission = "MiaoScript.debug")
    @Help("切换调试模式")
    public void debug(final CommandArgument e) {
        MLog.setDebug(!MLog.isDebug());
        e.getSender().sendMessage("§6调试模式: " + (MLog.isDebug() ? "§a开启" : "§c关闭"));
    }

    @Cmd(permission = "MiaoScript.listen")
    @Help("查看监听列表")
    public void listen(final CommandArgument e) {
        final CommandSender sender = e.getSender();
        for (final EventInfo ei : plugin.getManagerCenter().getEventManager().getEvents().values()) {
            ei.send(sender);
        }
    }

    @Cmd(permission = "MiaoScript.reload")
    @Help("重载配置文件")
    public void reload(final CommandArgument e) {
        plugin.reload();
        e.getSender().sendMessage("§a配置文件已重新载入!");
    }

    @Cmd(permission = "MiaoScript.run")
    @Help("解析脚本")
    public void run(final CommandArgument e) {
        final CommandSender sender = e.getSender();
        final String script = merge(e.getArgs(), 0);
        final MiaoScriptEngine engine = MiaoScriptEngine.getDefault();
        try {
            engine.put("Player", e.getSender());
            final long s = System.currentTimeMillis();
            final Object result = engine.eval(PlaceholderAPI.setPlaceholders((sender instanceof Player ? (Player) sender : null), script));
            sender.sendMessage(String.format("%s运行结果: %s 耗时: %s", Log.getPrefix(), String.valueOf(result), System.currentTimeMillis() - s));
        } catch (final ScriptException ex) {
            sender.sendMessage(String.format(Log.getPrefix() + "脚本语法错误: %s", ex.getMessage()));
        }
    }

    @Cmd(permission = "MiaoScript.script", minimumArguments = 1)
    @Help(value = "查看脚本信息", possibleArguments = "<脚本名称>")
    public void script(final CommandArgument e) {
        final CommandSender sender = e.getSender();
        final ScriptInfo s = plugin.getManagerCenter().getScriptManager().getScript(e.getArgs()[0]);
        if (s == null) {
            Log.toSender(sender, "脚本不存在!");
        } else {
            s.send(sender);
        }
    }

    private String merge(final String[] arr, final int index) {
        final StringBuffer strs = new StringBuffer();
        for (int i = index; i < arr.length; i++) {
            strs.append(arr[i]);
            strs.append(" ");
        }
        return strs.toString();
    }
}
