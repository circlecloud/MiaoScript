package pw.yumc.MiaoScript.javascript;

import java.io.Reader;

import javax.script.Bindings;
import javax.script.Invocable;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineFactory;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.bukkit.Bukkit;

import pw.yumc.MiaoScript.ManagerCenter;
import pw.yumc.MiaoScript.MiaoScript;
import pw.yumc.MiaoScript.misc.MLog;
import pw.yumc.MiaoScript.misc.StaticAgent;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;

/**
 * 喵式脚本引擎
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:51:43
 */
public class MiaoScriptEngine implements ScriptEngine, Invocable {
    private static MiaoScriptEngine DEFAULT;
    private final MiaoScript plugin = P.getPlugin();
    private final ManagerCenter mCenter = plugin.getManagerCenter();
    private ScriptEngine engine;

    public MiaoScriptEngine(final String engineType) {
        try {
            engine = new ScriptEngineManager().getEngineByName(engineType);
        } catch (final NullPointerException ex) {
            Log.warning("无效的解析引擎! 已设为默认值 'javascript'");
            engine = new ScriptEngineManager().getEngineByName("javascript");
        }
        engine.put("Bukkit", Bukkit.getServer());
        engine.put("Server", Bukkit.getServer());
        engine.put("ActionBar", new StaticAgent.ActionBar());
        engine.put("Title", new StaticAgent.Title());
        engine.put("MainConfig", mCenter.getConfigManager().get());
        engine.put("PlayerConfig", mCenter.getConfigManager());
        engine.put("SQL", mCenter.getSQLManager());
        engine.put("Prefix", Log.getPrefix());
        engine.put("Log", P.getLogger());
        engine.put("MLog", MLog.LOG);
    }

    public static MiaoScriptEngine getDefault() {
        if (DEFAULT == null) {
            DEFAULT = new MiaoScriptEngine("javascript");
        }
        return DEFAULT;
    }

    @Override
    public Bindings createBindings() {
        return engine.createBindings();
    }

    @Override
    public Object eval(final Reader reader) throws ScriptException {
        return engine.eval(reader);
    }

    @Override
    public Object eval(final Reader reader, final Bindings n) throws ScriptException {
        return engine.eval(reader, n);
    }

    @Override
    public Object eval(final Reader reader, final ScriptContext context) throws ScriptException {
        return engine.eval(reader, context);
    }

    @Override
    public Object eval(final String script) throws ScriptException {
        MLog.debug(script.split("\n"));
        return engine.eval(script);
    }

    @Override
    public Object eval(final String script, final Bindings n) throws ScriptException {
        return engine.eval(script, n);
    }

    @Override
    public Object eval(final String script, final ScriptContext context) throws ScriptException {
        return engine.eval(script, context);
    }

    @Override
    public Object get(final String key) {
        return engine.get(key);
    }

    @Override
    public Bindings getBindings(final int scope) {
        return engine.getBindings(scope);
    }

    @Override
    public ScriptContext getContext() {
        return engine.getContext();
    }

    @Override
    public ScriptEngineFactory getFactory() {
        return engine.getFactory();
    }

    @Override
    public <T> T getInterface(final Class<T> clasz) {
        return ((Invocable) engine).getInterface(clasz);
    }

    @Override
    public <T> T getInterface(final Object thiz, final Class<T> clasz) {
        return ((Invocable) engine).getInterface(thiz, clasz);
    }

    @Override
    public Object invokeFunction(final String name, final Object... args) throws ScriptException, NoSuchMethodException {
        final Object result = ((Invocable) engine).invokeFunction(name, args);
        engine.put("Event", null);
        engine.put("Player", null);
        engine.put("PlayerConfig", mCenter.getConfigManager());
        MLog.debug(String.valueOf(result));
        return result;
    }

    @Override
    public Object invokeMethod(final Object thiz, final String name, final Object... args) throws ScriptException, NoSuchMethodException {
        return ((Invocable) engine).invokeMethod(thiz, name, args);
    }

    @Override
    public void put(final String key, final Object value) {
        engine.put(key, value);
    }

    @Override
    public void setBindings(final Bindings bindings, final int scope) {
        engine.setBindings(bindings, scope);
    }

    @Override
    public void setContext(final ScriptContext context) {
        engine.setContext(context);
    }
}
