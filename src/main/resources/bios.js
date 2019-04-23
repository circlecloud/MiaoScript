'use strict';
var log;
var boot;
// noinspection ThisExpressionReferencesGlobalObjectJS
var global = this;
/**
 * 初始化框架引擎
 */
(function() {
    var loader;
    boot = function(root, logger) {
        log = logger;
        // 开发环境下初始化
        root = root || "src/main/resources";
        if (__FILE__ !== "<eval>") {
            logger.info('Loading custom BIOS file ' + __FILE__);
            global.debug = true;
        }
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "debug"))) {
            logger.info('Running debugging mode...');
            global.debug = true;
        }
        // 检查类加载器 防止找不到核心文件
        loader = checkClassLoader();
        // 解压文件到根目录 非调试模式直接从jar解压覆盖
        release(root, '(core|node_modules)+/.*', !global.debug);
        load(root + '/core/init.js');
        try {
            init(root);
        } catch (ex) {
            ex.printStackTrace();
        }
    };

    var pluginYml;

    function checkClassLoader() {
        // noinspection JSUnresolvedVariable
        var classLoader = java.lang.Thread.currentThread().contextClassLoader;
        pluginYml = classLoader.getResource("plugin.yml");
        if (pluginYml === null) {
            engineDisable = function engineDisable() { }
            throw Error("Error class loader: " + classLoader.class.name + " Please contact the author MiaoWoo!");
        } else {
            log.info("Class loader compatible: " + classLoader.class.name);
            if (classLoader.parent) {
                log.info("Parent class loader: " + classLoader.parent.class.name);
            }
        }
        return classLoader;
    }

    function release(root, regex, replace) {
        var filePath = pluginYml.getFile().substring(pluginYml.getFile().indexOf("/") + 1);
        var jarPath = java.net.URLDecoder.decode(filePath.substring(0, filePath.indexOf('!')));
        if (!java.nio.file.Files.exists(java.nio.file.Paths.get(jarPath))) {
            jarPath = "/" + jarPath;
        }
        var jar = new java.util.jar.JarFile(jarPath);
        var r = new RegExp(regex);// "[core|modules]/.*"
        jar.stream().forEach(function(entry) {
            try {
                // noinspection JSValidateTypes
                if (!entry.isDirectory()) {
                    if (r.test(entry.name)) {
                        var path = java.nio.file.Paths.get(root, entry.name);
                        // noinspection JSUnresolvedVariable
                        var parentFile = path.toFile().parentFile;
                        if (!parentFile.exists()) { parentFile.mkdirs(); }
                        if (!java.nio.file.Files.exists(path) || replace) {
                            java.nio.file.Files.copy(loader.getResourceAsStream(entry.name), path, java.nio.file.StandardCopyOption['REPLACE_EXISTING']);
                        }
                    }
                }
            } catch (ex) {
                ex.printStackTrace();
            }
        })
    }
})();