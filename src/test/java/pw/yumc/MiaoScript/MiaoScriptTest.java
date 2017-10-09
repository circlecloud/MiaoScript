package pw.yumc.MiaoScript;

import java.io.FileReader;

import javax.script.ScriptEngineManager;

import org.junit.Test;

import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.engine.MiaoScriptEngine;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/9/14 10:08.
 */
public class MiaoScriptTest {
    private MiaoScriptEngine engine;

    @Test
    public void testBoot() {
        Thread currentThread = Thread.currentThread();
        ClassLoader previousClassLoader = currentThread.getContextClassLoader();
        currentThread.setContextClassLoader(getClass().getClassLoader());
        try {
            ScriptEngineManager manager = new ScriptEngineManager();
            this.engine = new MiaoScriptEngine(manager);
            this.engine.put("base", new Base());
            this.engine.eval(new FileReader("src/main/resources/bios.js"));
            engine.invokeFunction("boot", null, engine);
        } catch (Exception e) {
            Log.w("脚本引擎初始化失败! %s:%s", e.getClass().getName(), e.getMessage());
            e.printStackTrace();
        } finally {
            currentThread.setContextClassLoader(previousClassLoader);
        }
    }
}