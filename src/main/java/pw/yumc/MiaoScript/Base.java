package pw.yumc.MiaoScript;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Collectors;

import lombok.val;
import pw.yumc.YumCore.annotation.NotProguard;
import pw.yumc.YumCore.mc.MinecraftTools;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/10/9 12:40.
 */
@NotProguard
public class Base {
    public Class getClass(String name) throws ClassNotFoundException {
        return Class.forName(name);
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
        val file = path.toFile();
        if (!file.exists()) { return; }
        if (file.isDirectory()) {
            for (Path f : Files.list(file.toPath()).collect(Collectors.toList())) {
                delete(f);
            }
        }
        Files.delete(path);
    }

    public Class getTools() {
        return MinecraftTools.class;
    }
}
