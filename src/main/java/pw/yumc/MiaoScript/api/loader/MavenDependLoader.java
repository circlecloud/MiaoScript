package pw.yumc.MiaoScript.api.loader;

import lombok.SneakyThrows;

import java.io.File;
import java.io.FileInputStream;
import java.net.URL;
import java.net.URLConnection;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;

public class MavenDependLoader {
    private static final String MavenRepo = "https://maven.aliyun.com/repository/public";

    public static File[] load(String libPath, String groupId, String artifactId, String version) {
        return new File[]{
                downloadAndCheckSha1(libPath, groupId, artifactId, version, "pom"),
                JarLoader.load(downloadAndCheckSha1(libPath, groupId, artifactId, version, "jar"))
        };
    }

    @SneakyThrows
    public static File downloadAndCheckSha1(String libPath, String groupId, String artifactId, String version, String ext) {
        File sha1 = getMavenFile(libPath, groupId, artifactId, version, ext + ".sha1");
        if (!sha1.exists()) {
            downloadFile(sha1, groupId, artifactId, version, ext + ".sha1");
        }
        File file = getMavenFile(libPath, groupId, artifactId, version, ext);
        if (!file.exists()) {
            downloadFile(file, groupId, artifactId, version, ext);
        }
        if (!new String(Files.readAllBytes(sha1.toPath())).equals(getSha1(file))) {
            file.delete();
            throw new IllegalStateException("file " + file.getName() + " sha1 not match.");
        }
        return file;
    }

    public static File getMavenFile(String libPath, String groupId, String artifactId, String version, String ext) {
        return Paths.get(libPath, groupId.replace(".", File.separator), artifactId, version, String.format("%s-%s.%s", artifactId, version, ext)).toFile();
    }

    @SneakyThrows
    public static void downloadFile(File target, String groupId, String artifactId, String version, String ext) {
        target.getParentFile().mkdirs();
        URLConnection connection = new URL(MavenRepo +
                String.format("/%1$s/%2$s/%3$s/%2$s-%3$s.%4$s",
                        groupId.replace(".", "/"),
                        artifactId,
                        version,
                        ext)
        ).openConnection();
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(30000);
        connection.setUseCaches(true);
        Files.copy(connection.getInputStream(), target.toPath(), StandardCopyOption.REPLACE_EXISTING);
    }

    @SneakyThrows
    private static String getSha1(File file) {
        MessageDigest digest = MessageDigest.getInstance("SHA-1");
        FileInputStream in = new FileInputStream(file);
        FileChannel ch = in.getChannel();
        MappedByteBuffer byteBuffer = ch.map(FileChannel.MapMode.READ_ONLY, 0, file.length());
        digest.update(byteBuffer);
        return getHash(digest.digest());
    }

    private static String getHash(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
