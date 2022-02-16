package pw.yumc.MiaoScript;

import cn.nukkit.plugin.PluginBase;
import lombok.SneakyThrows;

/**
 * @author MiaoWoo
 */
public class MiaoScriptNukkit extends PluginBase {
    private ScriptEngine engine;

    @SneakyThrows
    public MiaoScriptNukkit() {
        Thread.currentThread().setContextClassLoader(this.getClass().getClassLoader());
        engine = new ScriptEngine(getDataFolder().getCanonicalPath(), super.getLogger(), this);
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
