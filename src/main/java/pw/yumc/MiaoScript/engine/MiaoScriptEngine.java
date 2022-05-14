package pw.yumc.MiaoScript.engine;

import lombok.SneakyThrows;
import lombok.val;
import pw.yumc.MiaoScript.api.loader.JarLoader;
import pw.yumc.MiaoScript.api.loader.MavenDependLoader;

import javax.script.ScriptEngine;
import javax.script.*;
import java.io.File;
import java.io.Reader;
import java.lang.reflect.Method;
import java.util.HashMap;

/**
 * 喵式脚本引擎
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:51:43
 */
public class MiaoScriptEngine implements ScriptEngine, Invocable {
    private static MiaoScriptEngine DEFAULT;
    private static final ScriptEngineManager manager;

    private ScriptEngine engine;

    static {
        manager = new ScriptEngineManager(ClassLoader.getSystemClassLoader());
    }

    public static void setBindings(Bindings bindings) {
        manager.setBindings(bindings);
    }

    public static Bindings getBindings() {
        return manager.getBindings();
    }

    public MiaoScriptEngine() {
        this("js");
    }

    public MiaoScriptEngine(final String engineType) {
        this(manager, engineType, null);
    }

    public MiaoScriptEngine(ScriptEngineManager engineManager) {
        this(engineManager, "js", null);
    }

    public MiaoScriptEngine(final String engineType, String engineRoot) {
        this(manager, engineType, engineRoot);
    }

    public MiaoScriptEngine(ScriptEngineManager engineManager, final String engineType, String engineRoot) {
        // JDK11 Polyfill 存在类效验问题 直接用OpenJDK的Nashorn
        if (System.getProperty("java.version").startsWith("11.") && engineRoot != null) {
            this.loadNetworkNashorn(engineRoot);
            if (engine == null)
                throw new UnsupportedOperationException("当前环境 JDK11 不支持 Nashorn 脚本类型!");
            return;
        }
        try {
            engine = engineManager.getEngineByName(engineType);
        } catch (final NullPointerException ignored) {
        }
        if (engine == null) {
            val extDirs = System.getProperty("java.ext.dirs");
            if (extDirs != null) {
                this.loadLocalNashorn(extDirs, engineType);
            } else if (engineRoot != null) {
                this.loadNetworkNashorn(engineRoot);
            }
        }
        if (engine == null)
            throw new UnsupportedOperationException("当前环境不支持 " + engineType + " 脚本类型!");
    }

    private void loadLocalNashorn(String extDirs, String engineType) {
        val dirs = extDirs.split(File.pathSeparator);
        for (String dir : dirs) {
            File nashorn = new File(dir, "nashorn.jar");
            if (nashorn.exists()) {
                JarLoader.load(nashorn);
                this.createEngineByName(engineType);
            }
        }
    }

    @SneakyThrows
    private void loadNetworkNashorn(String engineRoot) {
        File libRootFile = new File(engineRoot, "libs");
        libRootFile.mkdirs();
        String libRoot = libRootFile.getCanonicalPath();
        MavenDependLoader.load(libRoot, "org.openjdk.nashorn", "nashorn-core", "15.3");
        MavenDependLoader.load(libRoot, "org.ow2.asm", "asm", "9.2");
        MavenDependLoader.load(libRoot, "org.ow2.asm", "asm-commons", "9.2");
        MavenDependLoader.load(libRoot, "org.ow2.asm", "asm-tree", "9.2");
        MavenDependLoader.load(libRoot, "org.ow2.asm", "asm-util", "9.2");
        Class<?> NashornScriptEngineFactory = Class.forName("org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory");
        Method getScriptEngine = NashornScriptEngineFactory.getMethod("getScriptEngine");
        Object factory = NashornScriptEngineFactory.newInstance();
        engine = (ScriptEngine) getScriptEngine.invoke(factory);
    }

    private void createEngineByName(String engineType) {
        try {
            engine = new ScriptEngineManager(Thread.currentThread().getContextClassLoader()).getEngineByName(engineType);
        } catch (NullPointerException ignored) {
        }
    }

    public ScriptEngine getEngine() {
        return this.engine;
    }

    public static MiaoScriptEngine getDefault() {
        if (DEFAULT == null) {
            DEFAULT = new MiaoScriptEngine();
        }
        return DEFAULT;
    }

    @Override
    public Bindings createBindings() {
        return new SimpleBindings(new HashMap<>(engine.getBindings(ScriptContext.GLOBAL_SCOPE)));
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
        return ((Invocable) engine).invokeFunction(name, args);
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
