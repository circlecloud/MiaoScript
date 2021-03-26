'use strict'
var global = this;
/**
 * Init MiaoScriptEngine Runtime
 */
(function () {
    global.engineDisable = function () {
        global.engineDisableImpl && global.engineDisableImpl()
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "old_node_modules"))) {
            logger.info('Found old_node_modules folder delete...')
            base.delete(java.nio.file.Paths.get(root, "old_node_modules"))
        }
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "upgrade"))) {
            logger.info('Found upgrade file delete node_modules...')
            base.delete(java.nio.file.Paths.get(root, "node_modules"))
            base.delete(java.nio.file.Paths.get(root, "upgrade"))
        }
    }
    global.boot = function (root, logger) {
        global.scope = java.lang.System.getenv("MS_NODE_CORE_SCOPE") || "@ccms"
        global.log = logger
        // Development Env Detect
        global.root = root || "src/main/resources"
        if (__FILE__.indexOf('!') === -1) {
            logger.info('Loading custom BIOS file ' + __FILE__)
            global.debug = true
        }
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "debug"))) {
            logger.info('Running in debug mode...')
            global.debug = true
        }
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "level"))) {
            global.level = base.read(java.nio.file.Paths.get(root, "level"))
            logger.info('Set system level to [' + global.level + ']...')
        }
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(root, "upgrade"))) {
            logger.info('Found upgrade file starting upgrade...')
            base.move(java.nio.file.Paths.get(root, "node_modules"), java.nio.file.Paths.get(root, "old_node_modules"))
            base.delete(java.nio.file.Paths.get(root, "upgrade"))
        }
        new java.lang.Thread(function () {
            try {
                base.delete(java.nio.file.Paths.get(root, "old_node_modules"))
            } catch (ex) {
            }
        }, "MiaoScript node_modules clean thread").start()
        // Check Class Loader, Sometimes Server will can't found plugin.yml file
        var loader = checkClassLoader()
        var future = new java.util.concurrent.FutureTask(function () {
            java.lang.Thread.currentThread().contextClassLoader = loader
            load(java.lang.System.getenv("MS_NODE_CORE_POLYFILL") || 'classpath:core/polyfill.js')(root, logger)
        })
        // Async Loading MiaoScript Engine
        new java.lang.Thread(future, "MiaoScript thread").start()
        return future
    }

    global.start = function (future) {
        if (!future.isDone()) {
            log.info("Waiting MiaoScript booted...")
            future.get()
        }
        log.info("MiaoScript booted starting...")
        global.engineDisableImpl = require(java.lang.System.getenv("MS_NODE_CORE_MODULE") || (global.scope + '/core')).default || function () {
            log.info('Error: abnormal Initialization MiaoScript Engine. Skip disable step...')
        }
    }

    function checkClassLoader() {
        var classLoader = java.lang.Thread.currentThread().contextClassLoader
        if (classLoader.getResource("bios.js") === null) {
            throw Error("Error class loader: " + classLoader.class.name + " Please contact the author MiaoWoo!")
        } else {
            log.info("Class loader compatible: " + classLoader.class.name)
            if (classLoader.parent) {
                log.info("Parent class loader: " + classLoader.parent.class.name)
            }
        }
        return classLoader
    }
})()
