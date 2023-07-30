package pw.yumc.MiaoScript.api.plugin;

import javax.script.Bindings;
import java.util.Map;

public interface PluginManager {
    Map<String, Bindings> getPlugins();

    Bindings getPlugin(String name);

    boolean has(String name);

    Bindings get(String name);

    boolean enable(String name);

    boolean disable(String name);

    boolean install(String name);

    boolean uninstall(String name);
}
