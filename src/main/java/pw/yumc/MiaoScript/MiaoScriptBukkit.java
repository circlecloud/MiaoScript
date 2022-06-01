package pw.yumc.MiaoScript;

import lombok.SneakyThrows;
import org.bukkit.plugin.java.JavaPlugin;
import pw.yumc.MiaoScript.api.MiaoScriptAPI;
import pw.yumc.MiaoScript.api.ScriptEngine;

/**
 * 喵式脚本
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:50:39
 */
public class MiaoScriptBukkit extends JavaPlugin {
    private ScriptEngine engine;

    @SneakyThrows
    public MiaoScriptBukkit() {
        ClassLoader origin = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(getClassLoader());
        engine = MiaoScriptAPI.createEngine(getDataFolder().getCanonicalPath(), getLogger(), this);
        Thread.currentThread().setContextClassLoader(origin);
        engine.loadEngine();
    }

    @Override
    public void onLoad() {
    }

    @Override
    public void onEnable() {
        engine.enableEngine();
    }

    @Override
    public void onDisable() {
        engine.disableEngine();
        engine = null;
    }
}
