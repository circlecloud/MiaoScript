package pw.yumc.MiaoScript;

import java.lang.Thread;
import java.io.InputStreamReader;
import java.util.logging.Level;
import java.util.logging.Logger;

import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.Path;

import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import pw.yumc.YumCore.engine.MiaoScriptEngine;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/10/25 21:01.
 */
public class ScriptEngine {
    private String root;
    private Object logger;
    private MiaoScriptEngine engine;

    public ScriptEngine(String root, Object logger) {
        this.root = root;
        this.logger = logger;
        enableEngine();
    }

    public void enableEngine() {
        try {
            ScriptEngineManager manager = new ScriptEngineManager(null);
            this.engine = new MiaoScriptEngine(manager, "nashorn");
            this.engine.put("base", new Base());
            Path bios = Paths.get(root, "bios.js");
            // 如果存在自定义bios就加载自定义的
            if (Files.exists(bios)) {
                this.engine.eval("load('" + bios.toFile().getCanonicalPath() + "')");
            } else {
                this.engine.eval(new InputStreamReader(Thread.currentThread().getContextClassLoader().getResourceAsStream("bios.js")));
            }
            engine.invokeFunction("boot", root, logger);
        } catch (Exception e) {
            // logger.log(Level.SEVERE, "MiaoScript 启动失败!", e);
        }
    }

    public void disableEngine() {
        try {
            engine.invokeFunction("disable");
        } catch (ScriptException | NoSuchMethodException e) {
            // logger.log(Level.SEVERE, "MiaoScript 关闭失败!", e);
        }
    }

    public MiaoScriptEngine getEngine() {
        return engine;
    }
}
