package pw.yumc.MiaoScript.api;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/10/9 12:40.
 */
public class Base {
    private final Object instance;

    Base(Object instance) {
        this.instance = instance;
    }

    public String getVersion() {
        return MiaoScriptAPI.VERSION;
    }

    public Class<?> getClass(String name) throws ClassNotFoundException {
        try {
            return Class.forName(name);
        } catch (Throwable ignored) {
        }
        try {
            return Class.forName(name, true, instance.getClass().getClassLoader());
        } catch (Throwable ex) {
            return Class.forName(name, true, instance.getClass().getClassLoader().getParent());
        }
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

    public File[] loadMavenDepend(String groupId, String artifactId, String version) {
        return MiaoScriptAPI.loadMavenDepend(groupId, artifactId, version);
    }

    public File[] loadMavenDepend(String groupId, String artifactId, String version, ClassLoader classLoader) {
        return MiaoScriptAPI.loadMavenDepend(groupId, artifactId, version, classLoader);
    }

    public File[] parentLoadMavenDepend(String groupId, String artifactId, String version) {
        return MiaoScriptAPI.parentLoadMavenDepend(groupId, artifactId, version);
    }

    public String read(String path) throws IOException {
        return read(Paths.get(path));
    }

    public String read(File file) throws IOException {
        return read(file.toPath());
    }

    public String read(Path path) throws IOException {
        return new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
    }

    public Path save(String path, String content) throws IOException {
        return save(Paths.get(path), content);
    }

    public Path save(File file, String content) throws IOException {
        return save(file.toPath(), content);
    }

    public Path save(Path path, String content) throws IOException {
        path.getParent().toFile().mkdirs();
        return Files.write(path, content.getBytes(StandardCharsets.UTF_8));
    }

    public boolean move(String source, String target) {
        return move(new File(source), new File(target));
    }

    public boolean move(File source, File target) {
        return source.renameTo(target);
    }

    public boolean delete(String path) throws IOException {
        return delete(new File(path));
    }

    public boolean delete(Path path) throws IOException {
        return delete(path.toFile());
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
                    this.delete(f);
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
