package pw.yumc.MiaoScript;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Collectors;

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

    public String read(String path) throws IOException {
        return new String(Files.readAllBytes(new File(path).toPath()), "UTF-8");
    }

    public void save(String path, String content) throws IOException {
        File file = new File(path);
        file.getParentFile().mkdirs();
        Files.write(file.toPath(), content.getBytes("UTF-8"));
    }

    public void delete(String path) throws IOException {
        delete(new File(path).toPath());
    }

    public void delete(Path path) throws IOException {
        File file = path.toFile();
        if (!file.exists()) { return; }
        if (file.isDirectory()) {
            for (Path f : Files.list(file.toPath()).collect(Collectors.toList())) {
                delete(f);
            }
        }
        Files.delete(path);
    }
}
