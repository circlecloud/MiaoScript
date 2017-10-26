package pw.yumc.MiaoScript;

import java.io.File;

import org.bukkit.Bukkit;
import org.bukkit.command.CommandSender;
import org.bukkit.event.HandlerList;
import org.bukkit.plugin.java.JavaPlugin;

import lombok.SneakyThrows;
import lombok.val;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.commands.CommandSub;
import pw.yumc.YumCore.commands.annotation.Cmd;
import pw.yumc.YumCore.commands.annotation.Help;
import pw.yumc.YumCore.commands.interfaces.Executor;

/**
 * 喵式脚本
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:50:39
 */
public class MiaoScript extends JavaPlugin implements Executor {
    private ScriptEngine engine;

    @Override
    @SneakyThrows
    public void onEnable() {
        new CommandSub("ms", this);
        engine = new ScriptEngine(getDataFolder().getCanonicalPath(), getClassLoader(), getLogger());
    }

    @Cmd
    @Help("执行 JS 代码")
    @SneakyThrows
    public void js(CommandSender sender, String script) {
        result(sender, engine.getEngine().eval(script));
    }

    @Cmd
    @Help("执行 JS 代码文件")
    @SneakyThrows
    public void file(CommandSender sender, String file) {
        result(sender, engine.getEngine().eval("load('" + new File(getDataFolder(), file).getCanonicalPath() + "')"));
    }

    @Cmd
    @Help("重启脚本引擎")
    public void reload(CommandSender sender) {
        engine.disableEngine();
        val server = Bukkit.getServer();
        try {
            server.getScheduler().cancelTasks(this);
            server.getServicesManager().unregisterAll(this);
            HandlerList.unregisterAll(this);
            server.getMessenger().unregisterIncomingPluginChannel(this);
            server.getMessenger().unregisterOutgoingPluginChannel(this);
        } catch (Exception ex) {
            Log.d("Error reload", ex);
        }
        engine.enableEngine();
        Log.sender(sender, "§bMiaoScript §eEngine §a重启完成!");
    }

    private void result(CommandSender sender, Object result) {
        if (result == null) {
            Log.sender(sender, "§a运行成功! §c没有返回结果!");
        } else {
            Log.sender(sender, "§a运行成功! §b数据类型: §r%s §d结果: §r%s", result.getClass().getName(), result);
        }
    }

    @Override
    public void onDisable() {
        engine.disableEngine();
    }
}
