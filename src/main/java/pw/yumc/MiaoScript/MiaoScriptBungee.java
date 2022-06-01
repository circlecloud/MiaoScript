package pw.yumc.MiaoScript;

import lombok.SneakyThrows;
import net.md_5.bungee.api.plugin.Plugin;
import pw.yumc.MiaoScript.api.MiaoScriptAPI;
import pw.yumc.MiaoScript.api.ScriptEngine;

/**
 * Created with IntelliJ IDEA
 *
 * @author MiaoWoo
 * Created on 2020/1/14 16:02.
 */
public class MiaoScriptBungee extends Plugin {
    private ScriptEngine engine;

    @SneakyThrows
    public MiaoScriptBungee() {
        Thread.currentThread().setContextClassLoader(this.getClass().getClassLoader());
        engine = MiaoScriptAPI.createEngine(getDataFolder().getCanonicalPath(), getLogger(), this);
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
