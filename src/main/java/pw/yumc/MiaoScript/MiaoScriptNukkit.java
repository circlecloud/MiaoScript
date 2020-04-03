package pw.yumc.MiaoScript;

import cn.nukkit.plugin.PluginBase;
import lombok.SneakyThrows;

/**
 * @author MiaoWoo
 */
public class MiaoScriptNukkit extends PluginBase {
    private ScriptEngine engine;

    @Override
    @SneakyThrows
    public void onEnable() {
        Thread.currentThread().setContextClassLoader(this.getClass().getClassLoader());
        engine = new ScriptEngine(getDataFolder().getCanonicalPath(), getLogger(), this);
        engine.enableEngine();
    }

    @Override
    public void onDisable() {
        engine.disableEngine();
        engine = null;
    }
}
