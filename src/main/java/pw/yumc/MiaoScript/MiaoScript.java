package pw.yumc.MiaoScript;

import org.bukkit.plugin.java.JavaPlugin;

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
    public void onLoad() {
        Thread.currentThread().setContextClassLoader(getClassLoader());
        engine = new ScriptEngine(getDataFolder().getCanonicalPath(), getLogger(), this);
        engine.loadEngine();
    }

    @Override
    public void onEnable() {
        engine.enableEngine();
    }

    @Override
    public void onDisable() {
        engine.disableEngine();
    }
}
