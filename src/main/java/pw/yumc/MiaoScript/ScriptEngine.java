package pw.yumc.MiaoScript;

import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.script.ScriptEngineManager;

import lombok.SneakyThrows;
import pw.yumc.YumCore.engine.MiaoScriptEngine;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 *         Created on 2017/10/25 21:01.
 */
public class ScriptEngine {
    private String root;
    private Object logger;
    private MiaoScriptEngine engine;

    public ScriptEngine(String root, Object logger) {
        this.root = root;
        this.logger = logger;
    }

    public void enableEngine() {
        enableEngine(Thread.currentThread().getContextClassLoader());
    }

    @SneakyThrows
    public void enableEngine(ClassLoader loader) {
        ScriptEngineManager manager = new ScriptEngineManager(null);
        this.engine = new MiaoScriptEngine(manager, "nashorn");
        this.engine.put("base", new Base());
        Path bios = Paths.get(root, "bios.js");
        // 如果存在自定义bios就加载自定义的
        if (Files.exists(bios)) {
            this.engine.eval("load('" + bios.toFile().getCanonicalPath() + "')");
        } else {
            this.engine.eval(new InputStreamReader(loader.getResourceAsStream("bios.js")));
        }
        engine.invokeFunction("boot", root, logger);
    }

    @SneakyThrows
    public void disableEngine() {
        engine.invokeFunction("disable");
    }

    public MiaoScriptEngine getEngine() {
        return engine;
    }
}
