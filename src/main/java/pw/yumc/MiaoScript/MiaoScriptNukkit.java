package pw.yumc.MiaoScript;

import cn.nukkit.plugin.PluginBase;
import lombok.SneakyThrows;
import pw.yumc.MiaoScript.api.MiaoScriptAPI;
import pw.yumc.MiaoScript.api.ScriptEngine;

/**
 * @author MiaoWoo
 */
public class MiaoScriptNukkit extends PluginBase {
    private ScriptEngine engine;

    @SneakyThrows
    public MiaoScriptNukkit() {
        Thread.currentThread().setContextClassLoader(this.getClass().getClassLoader());
        engine = MiaoScriptAPI.createEngine(getDataFolder().getCanonicalPath(), super.getLogger(), this);
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
