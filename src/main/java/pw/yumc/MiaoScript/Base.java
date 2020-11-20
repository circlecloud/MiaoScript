package pw.yumc.MiaoScript;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/10/9 12:40.
 */
public class Base {
    private Object instance;

    public Base(Object instance) {
        this.instance = instance;
    }

    public Class<?> getClass(String name) throws ClassNotFoundException {
        return Class.forName(name);
    }

    public Object getInstance() {
        return this.instance;
    }

    public Class<?> getProxyClass() {
        return ProxyClass.class;
    }

    public Class<?> getJavaScriptTaskClass() {
        return JavaScriptTask.class;
    }

    public String read(String path) throws IOException {
        return new String(Files.readAllBytes(new File(path).toPath()), StandardCharsets.UTF_8);
    }

    public void save(String path, String content) throws IOException {
        File file = new File(path);
        file.getParentFile().mkdirs();
        Files.write(file.toPath(), content.getBytes(StandardCharsets.UTF_8));
    }

    public boolean move(String source, String target) {
        File file = new File(source);
        return file.renameTo(new File(target));
    }

    public boolean delete(String path) throws IOException {
        return delete(new File(path));
    }

    public void delete(Path path) throws IOException {
        delete(path.toFile());
    }

    public boolean delete(File file) throws IOException {
        if (!file.exists()) {
            return false;
        }
        if (file.isFile()) {
            return file.delete();
        }
        File[] files = file.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isFile()) {
                    if (!f.delete()) {
                        f.deleteOnExit();
                    }
                } else {
                    this.delete(f.getAbsolutePath());
                }
            }
        }
        boolean result = file.delete();
        if (!result) {
            file.deleteOnExit();
        }
        return result;
    }
}
