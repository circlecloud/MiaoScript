(
    /**
     * @param {string} root
     * @param {any} logger
     */
    function (root, logger) {
        // Init Global Value
        global.root = root;
        global.logger = logger;
        global.ScriptEngineStartTime = new Date().getTime()
        global.engineLoad = load;
        global.noop = global.engineDisable = engineDisable = function () { };
        global.load = load = function __PreventGlobalLoadFunction__() { throw new Error('Internal engine system not allow use `load` function!'); }
        global.setGlobal = function (key, value, config) {
            if (config) {
                config.value = value;
                Object.defineProperty(global, key, config)
            } else {
                global[key] = value;
            }
        };
        // Init console and require
        global.console = engineLoad(java.lang.System.getenv("MS_NODE_CORE_CONSOLE") || 'classpath:core/console.js')(logger);
        console.log("Loading Engine at Thread", java.lang.Thread.currentThread().name)
        global.require = engineLoad(java.lang.System.getenv("MS_NODE_CORE_REQUIRE") || 'classpath:core/require.js')(root);
        require(global.scope + '/ployfill')
    }
)
