'use strict';
var log;
var boot;
var engineDisable;
var global = this;
/**
 * Init MiaoScriptEngine Runtime
 */
(function() {
    var loader;
    boot = function(root, logger) {
        log = logger;
        // Development Env Detect
        root = root || "src/main/resources";
        if (__FILE__ !== "<eval>") {
            logger.info('Loading custom BIOS file ' + __FILE__);
            global.debug = true;
        }
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "debug"))) {
            logger.info('Running in debug mode...');
            global.debug = true;
        }
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "level"))) {
            global.level = base.read(java.nio.file.Paths.get(root, "level"))
            logger.info('Set system level to [' + global.level + ']...');
        }
        // Check Class Loader, Sometimes Server will can't find plugin.yml file
        loader = checkClassLoader();
        // Force decompression core|node_modules to folder when not debug mode
        release(root, '(core|node_modules)+/.*', !global.debug);
        // Plugin file decompression to folder when file not exist
        release(root, '(plugins)+/.*', false);
        load(root + '/core/ployfill.js')(root, logger);
        engineDisable = require('@ms/core').default;
    };

    var pluginYml;
    function checkClassLoader() {
        var classLoader = java.lang.Thread.currentThread().contextClassLoader;
        pluginYml = classLoader.getResource("plugin.yml");
        if (pluginYml === null) {
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
        var r = new RegExp(regex);
        jar.stream().forEach(function(entry) {
            try {
                if (!entry.isDirectory()) {
                    if (r.test(entry.name)) {
                        var path = java.nio.file.Paths.get(root, entry.name);
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
