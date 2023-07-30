package pw.yumc.MiaoScript.api;

import lombok.Getter;
import pw.yumc.MiaoScript.api.loader.MavenDependLoader;
import pw.yumc.MiaoScript.api.plugin.PluginManager;
import pw.yumc.MiaoScript.engine.MiaoScriptEngine;

import java.io.File;
import java.nio.file.Paths;

public class MiaoScriptAPI {
    public static final String VERSION = "0.28.0";
    @Getter
    private static String root;
    private static String libPath;
    private static ScriptEngine scriptEngine;
    @Getter
    private static PluginManager pluginManager;

    public static ScriptEngine createEngine(String root, Object logger, Object instance) {
        MiaoScriptAPI.scriptEngine = new ScriptEngine(root, logger, instance);
        return MiaoScriptAPI.scriptEngine;
    }

    static void setRoot(String root) {
        MiaoScriptAPI.root = root;
        MiaoScriptAPI.libPath = Paths.get(root, "libs").toString();
    }

    public static MiaoScriptEngine getEngine() {
        return MiaoScriptAPI.scriptEngine.getEngine();
    }

    static void setEngine(ScriptEngine scriptEngine) {
        MiaoScriptAPI.scriptEngine = scriptEngine;
    }

    public static void setPluginManager(Object pluginManager) {
        MiaoScriptAPI.pluginManager = getEngine().getInterface(pluginManager, PluginManager.class);
    }

    public static File[] loadMavenDepend(String groupId, String artifactId, String version) {
        if (root == null || scriptEngine == null) {
            throw new IllegalStateException("root can't be null before loadMavenDepend.");
        }
        return MavenDependLoader.load(MiaoScriptAPI.libPath, groupId, artifactId, version);
    }

    public static File[] loadMavenDepend(String groupId, String artifactId, String version, ClassLoader classLoader) {
        if (root == null || scriptEngine == null) {
            throw new IllegalStateException("root can't be null before loadMavenDepend.");
        }
        return MavenDependLoader.load(MiaoScriptAPI.libPath, groupId, artifactId, version, classLoader);
    }

    public static File[] parentLoadMavenDepend(String groupId, String artifactId, String version) {
        if (root == null || scriptEngine == null) {
            throw new IllegalStateException("root can't be null before loadMavenDepend.");
        }
        return MavenDependLoader.parentLoad(MiaoScriptAPI.libPath, groupId, artifactId, version);
    }
}
