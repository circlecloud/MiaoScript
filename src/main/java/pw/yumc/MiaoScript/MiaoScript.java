package pw.yumc.MiaoScript;

import java.io.File;
import java.io.FileReader;
import java.io.InputStreamReader;

import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.bukkit.command.CommandSender;
import org.bukkit.plugin.java.JavaPlugin;

import lombok.SneakyThrows;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.commands.CommandSub;
import pw.yumc.YumCore.commands.annotation.Cmd;
import pw.yumc.YumCore.commands.annotation.Help;
import pw.yumc.YumCore.commands.interfaces.Executor;
import pw.yumc.YumCore.engine.MiaoScriptEngine;

/**
 * 喵式脚本
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:50:39
 */
public class MiaoScript extends JavaPlugin implements Executor {
    private MiaoScriptEngine engine;

    @Override
    public void onEnable() {
        new CommandSub("ms", this);
        saveScript();
        enableEngine();
    }

    @Cmd
    @Help("执行 JS 代码")
    @SneakyThrows
    public void js(CommandSender sender, String script) {
        result(sender, engine.eval(script));
    }

    @Cmd
    @Help("执行 JS 代码文件")
    @SneakyThrows
    public void file(CommandSender sender, String file) {
        result(sender, engine.eval(new FileReader(new File(getDataFolder(), file))));
    }

    @Cmd
    @Help("重启脚本引擎")
    public void reload(CommandSender sender) {
        disableEngine();
        enableEngine();
        Log.sender(sender, "§bMiaoScript §eEngine §a重启完成!");
    }

    private void result(CommandSender sender, Object result) {
        if (result == null) {
            Log.sender(sender, "§a运行成功! §c没有返回结果!");
        } else {
            Log.sender(sender, "§a运行成功! §b数据类型: §r%s §d结果: §r%s", result.getClass().getName(), result);
        }
    }

    private void saveScript() {
        P.saveFile(true, "core", "modules", "kit");
    }

    private void enableEngine() {
        Thread currentThread = Thread.currentThread();
        ClassLoader previousClassLoader = currentThread.getContextClassLoader();
        currentThread.setContextClassLoader(getClassLoader());
        try {
            ScriptEngineManager manager = new ScriptEngineManager();
            this.engine = new MiaoScriptEngine(manager);
            this.engine.put("base", new Base());
            this.engine.eval(new InputStreamReader(this.getResource("bios.js")));
            engine.invokeFunction("boot", this);
        } catch (Exception e) {
            Log.d(e);
        } finally {
            currentThread.setContextClassLoader(previousClassLoader);
        }
    }

    private void disableEngine() {
        try {
            engine.invokeFunction("disable");
        } catch (ScriptException | NoSuchMethodException e) {
            Log.w("脚本引擎关闭失败! %s:%s", e.getClass().getName(), e.getMessage());
            Log.d(e);
        }
    }

    @Override
    public void onDisable() {
        disableEngine();
    }
}
