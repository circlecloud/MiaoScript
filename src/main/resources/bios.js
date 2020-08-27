'use strict';
var global = this;
/**
 * Init MiaoScriptEngine Runtime
 */
(function () {
    var loader;
    global.boot = function (root, logger) {
        global.scope = java.lang.System.getenv("MS_NODE_CORE_SCOPE") || "@ccms";
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
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "upgrade"))) {
            logger.info('Found upgrade file starting upgrade...');
            base.delete(java.nio.file.Paths.get(root, "node_modules"))
            base.delete(java.nio.file.Paths.get(root, "upgrade"))
        }
        // Check Class Loader, Sometimes Server will can't found plugin.yml file
        loader = checkClassLoader();
        // Async Loading MiaoScript Engine
        new java.lang.Thread(function () {
            java.lang.Thread.currentThread().contextClassLoader = loader;
            load(java.lang.System.getenv("MS_NODE_CORE_PLOYFILL") || 'classpath:core/ployfill.js')(root, logger);
            global.engineDisable = require(java.lang.System.getenv("MS_NODE_CORE_MODULE") || global.scope + '/core').default || function () {
                logger.info('Error: abnormal Initialization MiaoScript Engine. Skip disable step...')
            };
        }, "MiaoScript thread").start()
    };

    function checkClassLoader() {
        var classLoader = java.lang.Thread.currentThread().contextClassLoader;
        if (classLoader.getResource("bios.js") === null) {
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
