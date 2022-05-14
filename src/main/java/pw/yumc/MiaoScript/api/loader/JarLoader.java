package pw.yumc.MiaoScript.api.loader;

import lombok.SneakyThrows;

import java.io.File;
import java.lang.invoke.MethodHandle;
import java.lang.invoke.MethodHandles;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URL;

public class JarLoader {
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

    private static void initReflect() {
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
}
