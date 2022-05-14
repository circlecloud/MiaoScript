package pw.yumc.MiaoScript.api.plugin;

import javax.script.Bindings;
import java.util.Map;

public interface PluginManager {
    Map<String, Bindings> getPlugins();

    Bindings getPlugin(String name);
}
