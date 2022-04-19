package pw.yumc.MiaoScript.api;

import pw.yumc.MiaoScript.MiaoScriptEngine;
import pw.yumc.MiaoScript.ScriptEngine;

public class MiaoScriptAPI {
    public static final String VERSION = "0.20.0";
    private static ScriptEngine scriptEngine;

    public static void setEngine(ScriptEngine scriptEngine) {
        MiaoScriptAPI.scriptEngine = scriptEngine;
    }

    public static MiaoScriptEngine getEngine() {
        return MiaoScriptAPI.scriptEngine.getEngine();
    }
}
