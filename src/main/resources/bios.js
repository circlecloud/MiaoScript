'use strict';
var log;
var boot;
var loader;
var disable;
/**
 * 初始化框架引擎
 */
(function () {
    boot = function (root, logger) {
        log = logger;
        // 开发环境下初始化
        root = root || "src/main/resources";
        var debug = false;
        if (__FILE__ !== "<eval>") {
            logger.info('载入自定义 BIOS 文件 ' + __FILE__);
            debug = true;
        }
        // 检查类加载器 防止找不到核心文件
        loader = checkClassLoader();
        // 解压文件到根目录 非调试模式直接从jar解压覆盖
        release(root, "[api|core|internal|modules]/.*", !debug);
        release(root, "plugins/.*");
        load(root + '/core/init.js');
        // 初始化必须在load之后 不然global找不到
        global.debug = debug;
        try {
            init(root);
        } catch (ex) {
            ex.printStackTrace();
        } finally {
            disable = function () {
                if (disablePlugins && typeof(disablePlugins) === "function") {
                    disablePlugins();
                }
            }
        }
    };

    var pluginYml;

    function checkClassLoader(){
        var classLoader = java.lang.Thread.currentThread().getContextClassLoader();
        pluginYml = classLoader.getResource("plugin.yml");
        if (pluginYml === null) {
            log.info("==================== ERROR ====================");
            log.info("异常的类加载器: " + classLoader.class.name);
            log.info("==================== ERROR ====================");
            throw Error('MiaoScript核心类库初始化失败 异常的类加载器!');
        }
        return classLoader;
    }

    function release(root, regex, replace) {
        var Files = Java.type("java.nio.file.Files");
        var Paths = Java.type("java.nio.file.Paths");
        var StandardCopyOption = Java.type("java.nio.file.StandardCopyOption");

        var upath = pluginYml.getFile().substring(pluginYml.getFile().indexOf("/") + 1);
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
        }
    }
})();