package pw.yumc.MiaoScript.engine;

import lombok.Getter;
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
    private final String libsRoot;

    @Getter
    private ScriptEngine engine;

    @SneakyThrows
    public MiaoScriptEngine(String engineRoot) {
        File libRootFile = new File(engineRoot, "libs");
        libRootFile.mkdirs();
        this.libsRoot = libRootFile.getCanonicalPath();
        if (new File(engineRoot, "debug").exists()) {
            System.setProperty("nashorn.debug", "true");
        }
        MavenDependLoader.load(this.libsRoot, "org.kamranzafar", "jtar", "2.3");
        if (getJavaVersion() > 15) {
            this.loadGraalJS();
        } else {
            this.loadNashorn();
        }
        if (engine == null)
            throw new UnsupportedOperationException("当前环境不支持 Nashorn 或 GraalJS 脚本引擎.");
    }

    private void loadGraalJS() {
        try {
            this.engine = this.parentLoadNetworkNashorn();
        } catch (Throwable ex) {
            this.engine = this.loadNetworkNashorn();
        }
        if (this.engine == null) {
            this.engine = this.loadNetworkGraalJS();
        }
    }

    private void loadNashorn() {
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
            if (this.engine == null) {
                this.engine = this.loadNetworkNashorn();
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

    private ScriptEngine loadNetworkNashorn() {
        MavenDependLoader.load(this.libsRoot, "org.openjdk.nashorn", "nashorn-core", "15.4");
        MavenDependLoader.load(this.libsRoot, "org.ow2.asm", "asm", "9.5");
        MavenDependLoader.load(this.libsRoot, "org.ow2.asm", "asm-commons", "9.5");
        MavenDependLoader.load(this.libsRoot, "org.ow2.asm", "asm-tree", "9.5");
        MavenDependLoader.load(this.libsRoot, "org.ow2.asm", "asm-util", "9.5");
        return createEngineByFactoryClassName("org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory", false);
    }

    private ScriptEngine parentLoadNetworkNashorn() {
        MavenDependLoader.parentLoad(this.libsRoot, "org.openjdk.nashorn", "nashorn-core", "15.4");
        MavenDependLoader.parentLoad(this.libsRoot, "org.ow2.asm", "asm", "9.5");
        MavenDependLoader.parentLoad(this.libsRoot, "org.ow2.asm", "asm-commons", "9.5");
        MavenDependLoader.parentLoad(this.libsRoot, "org.ow2.asm", "asm-tree", "9.5");
        MavenDependLoader.parentLoad(this.libsRoot, "org.ow2.asm", "asm-util", "9.5");
        return createEngineByFactoryClassName("org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory", false);
    }

    @SneakyThrows
    private ScriptEngine loadNetworkGraalJS() {
        MavenDependLoader.load(this.libsRoot, "org.graalvm.js", "js", "23.0.1");
        MavenDependLoader.load(this.libsRoot, "org.graalvm.js", "js-scriptengine", "23.0.1");
        MavenDependLoader.load(this.libsRoot, "org.graalvm.regex", "regex", "23.0.1");
        MavenDependLoader.load(this.libsRoot, "org.graalvm.sdk", "graal-sdk", "23.0.1");
        MavenDependLoader.load(this.libsRoot, "org.graalvm.truffle", "truffle-api", "23.0.1");
        System.setProperty("polyglot.js.nashorn-compat", "true");
        System.setProperty("polyglot.js.scripting", "true");
        System.setProperty("polyglot.js.ecmascript-version", "5");
        System.setProperty("polyglot.js.allowAllAccess", "true");
        Class<?> NashornScriptEngineFactory = Class.forName("com.oracle.truffle.js.scriptengine.GraalJSEngineFactory");
        Method getScriptEngine = NashornScriptEngineFactory.getMethod("getScriptEngine");
        Object factory = NashornScriptEngineFactory.newInstance();
        return (ScriptEngine) getScriptEngine.invoke(factory);
//        Class<?> GraalJSScriptEngine = Class.forName("com.oracle.truffle.js.scriptengine.GraalJSScriptEngine");
//        Method createScriptEngine = GraalJSScriptEngine.getMethod("create", Class.forName("org.graalvm.polyglot.Engine"), Class.forName("org.graalvm.polyglot.Context"));
//        Class<?> Context = Class.forName("org.graalvm.polyglot.Context");
//        Method newBuilder = Context.getMethod("newBuilder", String[].class);
//        Class<?> Builder = Class.forName("org.graalvm.polyglot.Context.Builder");
//        Method allowExperimentalOptions = Builder.getMethod("allowExperimentalOptions", boolean.class);
//        Method allowAllAccess = Builder.getMethod("allowAllAccess", boolean.class);
//        Method option = Builder.getMethod("option", String.class, String.class);
//        Object context = newBuilder.invoke(null, (Object) new String[]{"js"});
//        allowExperimentalOptions.invoke(context, true);
//        allowAllAccess.invoke(context, true);
//        option.invoke(context, "js.nashorn-compat", "true");
//        return (ScriptEngine) createScriptEngine.invoke(null, null, context);
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
