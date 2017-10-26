'use strict';
var log;
var boot;
var disable;
/**
 * 初始化框架引擎
 */
(function () {
    boot = function (root, logger) {
        log = logger;
        // 开发环境下初始化
        root = root || "src/main/resources";
        // 解压文件到根目录
        release(root, "[core|modules]/.*", true);
        release(root, "plugins/.*");
        load(root + '/core/init.js');
        try {
            init(root);
        } catch (ex) {
            throw ex;
        } finally {
            disable = disablePlugins
        }
    };

    function release(root, regex, replace) {
        print(Array.prototype.join.call(arguments, ' '));
        var Files = Java.type("java.nio.file.Files");
        var Paths = Java.type("java.nio.file.Paths");
        var StandardCopyOption = Java.type("java.nio.file.StandardCopyOption");

        var classLoader = java.lang.Thread.currentThread().getContextClassLoader();
        var url = classLoader.getResource("plugin.yml");
        if (url === null) {
            return;
        }
        var upath = url.getFile().substring(url.getFile().indexOf("/") + 1);
        var jarPath = java.net.URLDecoder.decode(upath.substring(0, upath.indexOf('!')));
        if (!Files.exists(Paths.get(jarPath))) {
            jarPath = "/" + jarPath;
        }
        try {
            var jar = new java.util.jar.JarFile(jarPath);
            var r = new RegExp(regex);// "[core|modules]/.*"
            jar.stream().forEach(function (entry) {
                if (!entry.isDirectory()) {
                    if (r.test(entry.name)) {
                        var path = Paths.get(root, entry.name);
                        var parentFile = path.toFile().parentFile;
                        if (!parentFile.exists()) {
                            parentFile.mkdirs();
                        }
                        Files.copy(classLoader.getResourceAsStream(entry.name), path, StandardCopyOption[replace ? 'REPLACE_EXISTING' : 'ATOMIC_MOVE']);
                    }
                }
            })
        } catch (ex) {

        } finally {
        }
    }
})();