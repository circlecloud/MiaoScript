package pw.yumc.MiaoScript;

import lombok.SneakyThrows;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜 Created on 2017/10/25 21:01.
 */
public class ScriptEngine {
    private final ClassLoader loader;
    private final Object logger;
    private final String root;
    private final Base base;
    private MiaoScriptEngine engine;
    private Object future;

    public ScriptEngine(String root, Object logger, Object instance) {
        this.loader = Thread.currentThread().getContextClassLoader();
        this.root = root;
        this.logger = logger;
        this.base = new Base(instance);
    }

    public void createEngine() {
        synchronized (logger) {
            if (this.engine == null) {
                this.engine = new MiaoScriptEngine("nashorn", root);
                this.engine.put("base", this.base);
                this.engine.put("ScriptEngineContextHolder", this);
            }
        }
    }

    @SneakyThrows
    public void loadEngine() {
        ClassLoader originLoader = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(this.loader);
        createEngine();
        Path bios = Paths.get(root, "bios.js");
        // 如果存在自定义bios就加载自定义的
        if (Files.exists(bios)) {
            this.engine.eval("load('" + bios.toFile().getCanonicalPath() + "')");
        } else {
            this.engine.eval("load('classpath:bios.js')");
        }
        future = engine.invokeFunction("boot", root, logger);
        Thread.currentThread().setContextClassLoader(originLoader);
    }

    @SneakyThrows
    public void enableEngine() {
        if (this.engine != null) {
            engine.invokeFunction("enable", future);
        }
    }

    @SneakyThrows
    public void disableEngine() {
        synchronized (logger) {
            if (this.engine != null) {
                this.engine.invokeFunction("disable");
                this.engine = null;
            }
        }
    }

    public MiaoScriptEngine getEngine() {
        return engine;
    }
}
