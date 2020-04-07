(
    /**
     * @param {string} root
     * @param {any} logger
     */
    function(root, logger) {
        // Init Global Value
        global.root = root;
        global.logger = logger;
        global.NashornEngineStartTime = new Date().getTime()
        global.engineLoad = load;
        global.noop = global.engineDisable = engineDisable = function() { };
        global.load = load = function __PreventGlobalLoadFunction__() { throw new Error('Internal engine system not allow use `load` function!'); }
        global.setGlobal = function(key, value) { global[key] = value; };
        // Init console and require
        global.console = engineLoad(global.root + '/core/console.js')(logger);
        console.log("Loading Engine at Thread", java.lang.Thread.currentThread().name)
        global.require = engineLoad(global.root + '/core/require.js')(root);
        require('@ms/ployfill')
        require('@ms/nodejs')
    }
);
