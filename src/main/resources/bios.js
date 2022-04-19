'use strict'
var global = this;
/**
 * Init MiaoScriptEngine Runtime
 */
/*global base ScriptEngineContextHolder*/
(function () {
    var Files = Java.type('java.nio.file.Files')
    var Paths = Java.type('java.nio.file.Paths')
    var System = Java.type('java.lang.System')
    var Thread = Java.type('java.lang.Thread')
    var FutureTask = Java.type('java.util.concurrent.FutureTask')

    global.boot = function (root, logger) {
        global.scope = System.getenv("MS_NODE_CORE_SCOPE") || "@ccms"
        global.logger = logger
        // Development Env Detect
        global.root = root || "src/main/resources"
        checkDebug()
        if (!global.debug) {
            checkUpgrade()
        }
        return bootEngineThread(checkClassLoader())
    }

    function bootEngineThread(loader) {
        logger.info("ScriptEngine: " + ScriptEngineContextHolder.getEngine().getEngine().class.name)
        var future = new FutureTask(function () {
            Thread.currentThread().contextClassLoader = loader
            load(System.getenv("MS_NODE_CORE_POLYFILL") || 'classpath:core/polyfill.js')(root, logger)
        })
        // Async Loading MiaoScript Engine
        new Thread(future, "MiaoScript thread").start()
        return future
    }

    global.enable = function (future) {
        if (!future.isDone()) {
            logger.info("Waiting MiaoScript booted...")
        }
        // await polyfill loading
        future.get()
        logger.info("MiaoScript booted starting...")
        global.engineDisableImpl = require(System.getenv("MS_NODE_CORE_MODULE") || (global.scope + '/core')).default || function () {
            logger.info('Error: abnormal Initialization MiaoScript Engine. Skip disable step...')
        }
    }

    global.disable = function () {
        global.engineDisableImpl && global.engineDisableImpl()
    }

    function checkDebug() {
        if (__FILE__.indexOf('!') === -1) {
            logger.info('Loading custom BIOS file ' + __FILE__)
            global.debug = true
        }
        if (Files.exists(Paths.get(root, "debug"))) {
            logger.info('Running in debug mode...')
            global.debug = true
        }
        if (Files.exists(Paths.get(root, "level"))) {
            global.level = base.read(Paths.get(root, "level"))
            logger.info('Set system level to [' + global.level + ']...')
        }
    }

    function checkUpgrade() {
        if (Files.exists(Paths.get(root, "upgrade"))) {
            logger.info('Found upgrade file starting upgrade...')
            base.move(Paths.get(root, "node_modules"), Paths.get(root, "old_node_modules"))
            base.delete(Paths.get(root, "upgrade"))
        }
        new Thread(function () {
            try {
                base.delete(Paths.get(root, "old_node_modules"))
            } catch (ex) {
            }
        }, "MiaoScript node_modules clean thread").start()
    }

    function checkClassLoader() {
        // Check Class Loader, Sometimes Server will can't found plugin.yml file
        var classLoader = Thread.currentThread().contextClassLoader
        if (classLoader.getResource("bios.js") === null) {
            throw Error("Error class loader: " + classLoader.class.name + " Please contact the author MiaoWoo!")
        } else {
            logger.info("Class loader compatible: " + classLoader.class.name)
            if (classLoader.parent) {
                logger.info("Parent class loader: " + classLoader.parent.class.name)
            }
        }
        return classLoader
    }
})()
