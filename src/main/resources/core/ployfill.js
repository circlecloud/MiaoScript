(
    /**
     * @param {string} root
     * @param {any} logger
     */
    function(root, logger) {
        // Init Global Value
        global.root = root;
        global.logger = logger;
        // Init Global Function
        global.noop = global.engineDisable = function() { };
        global.engineLoad = load;
        global.load = load = function __PreventGlobalLoadFunction__() {
            throw new Error('Internal engine system not allow use `load` function!');
        }
        global.NashornEngineStartTime = new Date().getTime()
        // Init console and require
        global.setGlobal = function(key, value) {
            global[key] = value;
        }
        global.console = engineLoad(global.root + '/core/console.js')(logger);
        global.require = engineLoad(global.root + '/core/require.js')(root);
        require('@ms/ployfill')
    }
);
