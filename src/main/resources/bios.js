'use strict';
var global = this;
/**
 * Init MiaoScriptEngine Runtime
 */
(function () {
    var loader;
    global.boot = function (root, logger) {
        global.scope = "@ccms";
        global.log = logger;
        // Development Env Detect
        global.root = root || "src/main/resources";
        if (__FILE__.indexOf('!') === -1) {
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
        // Check Class Loader, Sometimes Server will can't found plugin.yml file
        loader = checkClassLoader();
        // Async Loading MiaoScript Engine
        new java.lang.Thread(function () {
            java.lang.Thread.currentThread().contextClassLoader = loader;
            load('classpath:core/ployfill.js')(root, logger);
            global.engineDisable = require(global.scope + '/core').default || function () { logger.info('Error: abnormal Initialization MiaoScript Engine. Skip disable step...') };
        }, "MiaoScript thread").start()
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
})();
