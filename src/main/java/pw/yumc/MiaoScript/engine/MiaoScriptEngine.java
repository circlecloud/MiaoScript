package pw.yumc.MiaoScript.engine;

import lombok.SneakyThrows;
import lombok.val;
import pw.yumc.MiaoScript.api.loader.JarLoader;
import pw.yumc.MiaoScript.api.loader.MavenDependLoader;

import javax.script.*;
import java.io.File;
import java.io.Reader;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * 喵式脚本引擎
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:51:43
 */
public class MiaoScriptEngine implements ScriptEngine, Invocable {
    private ScriptEngine engine;

    public MiaoScriptEngine(String engineRoot) {
        if (new File(engineRoot, "debug").exists()) {
            System.setProperty("nashorn.debug", "true");
        }
        if (getJavaVersion() > 15) {
            this.loadGraalJS(engineRoot);
        } else {
            this.loadNashorn(engineRoot);
        }
        if (engine == null)
            throw new UnsupportedOperationException("当前环境不支持 Nashorn 或 GraalJS 脚本引擎.");
    }

    private void loadGraalJS(String engineRoot) {
        this.engine = this.parentLoadNetworkNashorn(engineRoot);
        if (this.engine == null) {
            this.engine = this.loadNetworkGraalJS(engineRoot);
        }
    }

    private void loadNashorn(String engineRoot) {
        try {
            this.createEngineByName();
        } catch (final Throwable ex) {
            ex.printStackTrace();
        }
        try {
            val extDirs = System.getProperty("java.ext.dirs");
            if (this.engine == null && extDirs != null) {
                this.engine = this.loadLocalNashorn(extDirs);
            }
        } catch (final Throwable ex) {
            ex.printStackTrace();
        }
        try {
            if (this.engine == null && engineRoot != null) {
                this.engine = this.loadNetworkNashorn(engineRoot);
            }
        } catch (final Throwable ex) {
            ex.printStackTrace();
        }
        if (this.engine == null)
            throw new UnsupportedOperationException("当前环境不支持 Nashorn 脚本引擎.");
    }

    private int getJavaVersion() {
        String version = System.getProperty("java.version");
        if (version.startsWith("1.")) {
            version = version.substring(2, 3);
        } else {
            int dot = version.indexOf(".");
            if (dot != -1) {
                version = version.substring(0, dot);
            }
        }
        return Integer.parseInt(version);
    }

    private ScriptEngine loadLocalNashorn(String extDirs) {
        val dirs = extDirs.split(File.pathSeparator);
        for (String dir : dirs) {
            File nashorn = new File(dir, "nashorn.jar");
            if (nashorn.exists()) {
                JarLoader.load(nashorn);
                return this.createEngineByName();
            }
        }
        return null;
    }

    @SneakyThrows
    private ScriptEngine loadNetworkNashorn(String engineRoot) {
        File libRootFile = new File(engineRoot, "libs");
        libRootFile.mkdirs();
        String libRoot = libRootFile.getCanonicalPath();
        MavenDependLoader.load(libRoot, "org.openjdk.nashorn", "nashorn-core", "15.4");
        MavenDependLoader.load(libRoot, "org.ow2.asm", "asm", "9.3");
        MavenDependLoader.load(libRoot, "org.ow2.asm", "asm-commons", "9.3");
        MavenDependLoader.load(libRoot, "org.ow2.asm", "asm-tree", "9.3");
        MavenDependLoader.load(libRoot, "org.ow2.asm", "asm-util", "9.3");
        return createEngineByFactoryClassName("org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory", false);
    }

    @SneakyThrows
    private ScriptEngine parentLoadNetworkNashorn(String engineRoot) {
        File libRootFile = new File(engineRoot, "libs");
        libRootFile.mkdirs();
        String libRoot = libRootFile.getCanonicalPath();
        MavenDependLoader.parentLoad(libRoot, "org.openjdk.nashorn", "nashorn-core", "15.4");
        MavenDependLoader.parentLoad(libRoot, "org.ow2.asm", "asm", "9.3");
        MavenDependLoader.parentLoad(libRoot, "org.ow2.asm", "asm-commons", "9.3");
        MavenDependLoader.parentLoad(libRoot, "org.ow2.asm", "asm-tree", "9.3");
        MavenDependLoader.parentLoad(libRoot, "org.ow2.asm", "asm-util", "9.3");
        return createEngineByFactoryClassName("org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory", false);
    }

    @SneakyThrows
    private ScriptEngine loadNetworkGraalJS(String engineRoot) {
        File libRootFile = new File(engineRoot, "libs");
        libRootFile.mkdirs();
        String libRoot = libRootFile.getCanonicalPath();
        MavenDependLoader.load(libRoot, "org.graalvm.js", "js", "22.1.0.1");
        MavenDependLoader.load(libRoot, "org.graalvm.js", "js-scriptengine", "22.1.0.1");
        MavenDependLoader.load(libRoot, "org.graalvm.regex", "regex", "22.1.0.1");
        MavenDependLoader.load(libRoot, "org.graalvm.sdk", "graal-sdk", "22.1.0.1");
        MavenDependLoader.load(libRoot, "org.graalvm.truffle", "truffle-api", "22.1.0.1");
        return createEngineByFactoryClassName("org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory", false);
    }

    @SneakyThrows
    private ScriptEngine createEngineByName() {
        return createEngineByFactoryClassName("jdk.nashorn.api.scripting.NashornScriptEngineFactory", true);
    }

    @SneakyThrows
    private ScriptEngine createEngineByFactoryClassName(String factoryClassName, boolean jdk) {
        Class<?> NashornScriptEngineFactory = Class.forName(factoryClassName);
        Method getScriptEngine = NashornScriptEngineFactory.getMethod("getScriptEngine", String[].class);
        Object factory = NashornScriptEngineFactory.newInstance();
        List<String> engineArgs = new ArrayList<>();
        engineArgs.add("--language=es5");
        engineArgs.add("--optimistic-types=false");
        if (getJavaVersion() >= 11 && jdk) {
            engineArgs.add("--no-deprecation-warning");
        }
        return (ScriptEngine) getScriptEngine.invoke(factory, (Object) engineArgs.toArray(new String[]{}));
    }

    public ScriptEngine getEngine() {
        return this.engine;
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
    public <T> T getInterface(final Class<T> cls) {
        return ((Invocable) engine).getInterface(cls);
    }

    @Override
    public <T> T getInterface(final Object thiz, final Class<T> cls) {
        return ((Invocable) engine).getInterface(thiz, cls);
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
