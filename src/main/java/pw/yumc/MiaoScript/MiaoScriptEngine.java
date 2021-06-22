package pw.yumc.MiaoScript;

import lombok.SneakyThrows;
import lombok.val;

import javax.script.ScriptEngine;
import javax.script.*;
import java.io.File;
import java.io.Reader;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;

/**
 * 喵式脚本引擎
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:51:43
 */
public class MiaoScriptEngine implements ScriptEngine, Invocable {
    private static String MavenRepo = "https://maven.aliyun.com/repository/public";
    private static MiaoScriptEngine DEFAULT;
    private static final ScriptEngineManager manager;

    private Object ucp;
    private MethodHandle addURLMethodHandle;
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
        try {
            engine = engineManager.getEngineByName(engineType);
        } catch (final NullPointerException ignored) {
        }
        if (engine == null) {
            val extDirs = System.getProperty("java.ext.dirs");
            if (extDirs != null) {
                val dirs = extDirs.split(File.pathSeparator);
                for (String dir : dirs) {
                    File nashorn = new File(dir, "nashorn.jar");
                    if (nashorn.exists()) {
                        this.loadJar(nashorn);
                        this.createEngineByName(engineType);
                    }
                }
            } else if (engineRoot != null) {
                this.loadLocalNashorn(engineRoot);
            }
        }
        if (engine == null)
            throw new UnsupportedOperationException("当前环境不支持 " + engineType + " 脚本类型!");
    }

    private void initReflect() {
        try {
            ClassLoader loader = Thread.currentThread().getContextClassLoader();
            Field theUnsafe = sun.misc.Unsafe.class.getDeclaredField("theUnsafe");
            theUnsafe.setAccessible(true);
            sun.misc.Unsafe unsafe = (sun.misc.Unsafe) theUnsafe.get(null);
            Field field = MethodHandles.Lookup.class.getDeclaredField("IMPL_LOOKUP");
            MethodHandles.Lookup lookup = (MethodHandles.Lookup) unsafe.getObject(unsafe.staticFieldBase(field), unsafe.staticFieldOffset(field));
            Field ucpField;
            try {
                ucpField = loader.getClass().getDeclaredField("ucp");
            } catch (NoSuchFieldException e) {
                ucpField = loader.getClass().getSuperclass().getDeclaredField("ucp");
            }
            long offset = unsafe.objectFieldOffset(ucpField);
            ucp = unsafe.getObject(loader, offset);
            Method method = ucp.getClass().getDeclaredMethod("addURL", URL.class);
            addURLMethodHandle = lookup.unreflect(method);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @SneakyThrows
    private void loadLocalNashorn(String engineRoot) {
        initReflect();
        File libRootFile = new File(engineRoot, "lib");
        libRootFile.mkdirs();
        String libRoot = libRootFile.getCanonicalPath();
        downloadJar(libRoot, "org.openjdk.nashorn", "nashorn-core", "15.2");
        downloadJar(libRoot, "org.ow2.asm", "asm", "9.1");
        downloadJar(libRoot, "org.ow2.asm", "asm-commons", "9.1");
        downloadJar(libRoot, "org.ow2.asm", "asm-tree", "9.1");
        downloadJar(libRoot, "org.ow2.asm", "asm-util", "9.1");
        this.createEngineByName("nashorn");
    }

    @SneakyThrows
    private void loadJar(File file) {
        addURLMethodHandle.invoke(ucp, file.toURI().toURL());
    }

    @SneakyThrows
    private void downloadJar(String engineRoot, String groupId, String artifactId, String version) {
        File lib = new File(engineRoot, artifactId + ".jar");
        if (!lib.exists()) {
            Files.copy(new URL(MavenRepo +
                            String.format("/%1$s/%2$s/%3$s/%2$s-%3$s.jar",
                                    groupId.replace(".", "/"),
                                    artifactId,
                                    version)
                    ).openStream(),
                    lib.toPath(),
                    StandardCopyOption.REPLACE_EXISTING);
        }
        this.loadJar(lib);
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
