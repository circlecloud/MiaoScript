package pw.yumc.MiaoScript.api.loader;

import lombok.SneakyThrows;

import java.io.File;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URL;

public class JarLoader {
    private static sun.misc.Unsafe unsafe;
    private static long offset;
    private static Object parentUcp;
    private static Object ucp;
    private static MethodHandle addURLMethodHandle;

    static {
        initReflect();
    }

    @SneakyThrows
    public static File load(File file) {
        addURLMethodHandle.invoke(ucp, file.toURI().toURL());
        return file;
    }

    @SneakyThrows
    public static File parentLoad(File file) {
        if (parentUcp == null)
            throw new IllegalStateException("parentUcp is null.");
        addURLMethodHandle.invoke(parentUcp, file.toURI().toURL());
        return file;
    }

    @SneakyThrows
    public static File load(File file, ClassLoader loader) {
        addURLMethodHandle.invoke(unsafe.getObject(loader, offset), file.toURI().toURL());
        return file;
    }

    private static void initReflect() {
        try {
            ClassLoader loader = JarLoader.class.getClassLoader();
            Field theUnsafe = sun.misc.Unsafe.class.getDeclaredField("theUnsafe");
            theUnsafe.setAccessible(true);
            unsafe = (sun.misc.Unsafe) theUnsafe.get(null);
            Field field = MethodHandles.Lookup.class.getDeclaredField("IMPL_LOOKUP");
            MethodHandles.Lookup lookup = (MethodHandles.Lookup) unsafe.getObject(unsafe.staticFieldBase(field), unsafe.staticFieldOffset(field));
            Field ucpField;
            try {
                ucpField = loader.getClass().getDeclaredField("ucp");
            } catch (NoSuchFieldException e) {
                ucpField = loader.getClass().getSuperclass().getDeclaredField("ucp");
            }
            offset = unsafe.objectFieldOffset(ucpField);
            ucp = unsafe.getObject(loader, offset);
            Method method = ucp.getClass().getDeclaredMethod("addURL", URL.class);
            addURLMethodHandle = lookup.unreflect(method);
            if (loader.getParent() != null)
                parentUcp = unsafe.getObject(loader.getParent(), offset);
        } catch (Throwable e) {
            throw new RuntimeException(e);
        }
    }
}
