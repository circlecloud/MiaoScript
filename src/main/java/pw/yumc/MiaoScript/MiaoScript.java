package pw.yumc.MiaoScript;

import org.bukkit.plugin.java.JavaPlugin;

import java.lang.Thread;
import lombok.SneakyThrows;

/**
 * 喵式脚本
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:50:39
 */
public class MiaoScript extends JavaPlugin {
    private ScriptEngine engine;

    @Override
    @SneakyThrows
    public void onEnable() {
        Thread.currentThread().setContextClassLoader(getClassLoader());
        engine = new ScriptEngine(getDataFolder().getCanonicalPath(), getLogger());
        engine.enableEngine();
    }

    @Override
    public void onDisable() {
        engine.disableEngine();
    }
}
