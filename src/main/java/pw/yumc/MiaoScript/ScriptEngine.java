package pw.yumc.MiaoScript;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.script.ScriptEngineManager;

import lombok.SneakyThrows;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜 Created on 2017/10/25 21:01.
 */
public class ScriptEngine {
    private String root;
    private Object logger;
    private Base base;
    private MiaoScriptEngine engine;
    private ScriptEngineManager manager;

    public ScriptEngine(String root, Object logger, Object instance) {
        this.root = root;
        this.logger = logger;
        this.base = new Base(instance);
        this.manager = new ScriptEngineManager();
    }

    @SneakyThrows
    public synchronized void enableEngine() {
        if (this.engine == null) {
            this.engine = new MiaoScriptEngine(manager, "nashorn");
            this.engine.put("base", this.base);
            this.engine.put("ScriptEngineContextHolder", this);
            Path bios = Paths.get(root, "bios.js");
            // 如果存在自定义bios就加载自定义的
            if (Files.exists(bios)) {
                this.engine.eval("load('" + bios.toFile().getCanonicalPath() + "')");
            } else {
                this.engine.eval("load('classpath:bios.js')");
            }
            engine.invokeFunction("boot", root, logger);
        }
    }

    @SneakyThrows
    public synchronized void disableEngine() {
        if (this.engine != null) {
            this.engine.invokeFunction("engineDisable");
            this.engine = null;
        }
    }

    public MiaoScriptEngine getEngine() {
        return engine;
    }
}
