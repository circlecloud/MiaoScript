package pw.yumc.MiaoScript;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;

import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.bukkit.plugin.java.JavaPlugin;

import pw.yumc.YumCore.annotation.NotProguard;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.bukkit.compatible.C;
import pw.yumc.YumCore.engine.MiaoScriptEngine;
import pw.yumc.YumCore.mc.MinecraftTools;

/**
 * 喵式脚本
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:50:39
 */
public class MiaoScript extends JavaPlugin {
    private MiaoScriptEngine engine;

    @Override
    public void onEnable() {
        saveScript();
        loadEngine();
    }

    @Override
    public void onDisable() {
        try {
            engine.invokeFunction("disable");
        } catch (ScriptException | NoSuchMethodException e) {
            Log.w("脚本引擎关闭失败! %s:%s", e.getClass().getName(), e.getMessage());
            Log.d(e);
        }
    }

    private void saveScript() {
        P.saveFile(true, "core", "modules", "plugins");
    }

    private void loadEngine() {
        Thread currentThread = Thread.currentThread();
        ClassLoader previousClassLoader = currentThread.getContextClassLoader();
        currentThread.setContextClassLoader(getClassLoader());
        try {
            ScriptEngineManager manager = new ScriptEngineManager();
            this.engine = new MiaoScriptEngine(manager);
            this.engine.put("base", new Base());
            this.engine.eval(new InputStreamReader(this.getResource("bios.js")));
            engine.invokeFunction("boot", this);
        } catch (Exception e) {
            Log.w("脚本引擎初始化失败! %s:%s", e.getClass().getName(), e.getMessage());
            Log.d(e);
        } finally {
            currentThread.setContextClassLoader(previousClassLoader);
        }
    }

    @NotProguard
    public static class Base {
        public Class getClass(String name) throws ClassNotFoundException {
            return Class.forName(name);
        }

        public Class getLog() {
            return Log.class;
        }

        public String read(String path) throws IOException {
            Log.d("读取文件 %s ...", path);
            return new String(Files.readAllBytes(new File(path).toPath()), "UTF-8");
        }

        public void save(String path, String content) throws IOException {
            Log.d("保存文件 %s ...", path);
            Files.write(new File(path).toPath(), content.getBytes("UTF-8"));
        }

        public Class getActionBar() {
            return C.ActionBar.class;
        }

        public Class getTitle() {
            return C.Title.class;
        }

        public Class getPlayer() {
            return C.Player.class;
        }

        public Class getTools() {
            return MinecraftTools.class;
        }
    }
}
