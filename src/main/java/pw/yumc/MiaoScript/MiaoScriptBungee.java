package pw.yumc.MiaoScript;

import lombok.SneakyThrows;
import net.md_5.bungee.api.plugin.Plugin;

/**
 * Created with IntelliJ IDEA
 *
 * @author MiaoWoo
 * Created on 2020/1/14 16:02.
 */
public class MiaoScriptBungee extends Plugin {
    private ScriptEngine engine;

    @Override
    @SneakyThrows
    public void onEnable() {
        engine = new ScriptEngine(getDataFolder().getCanonicalPath(), getLogger(), this);
        engine.enableEngine();
    }

    @Override
    public void onDisable() {
        engine.disableEngine();
    }
}
