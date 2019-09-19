(function(root, logger) {
    // Init Global Value
    global.root = root;
    global.logger = logger;
    // Init Global Function
    global.noop = global.engineDisable = function() { };
    global.engineLoad = load;
    global.load = load = function __PreventGlobalLoadFunction__() {
        throw new Error('Internal engine system not allow use `load` function!');
    };
    // Init console and require
    global.console = engineLoad(global.root + '/core/console.js')(logger);
    global.require = engineLoad(global.root + '/core/require.js')(root);
    // String contains playfill
    String.prototype.contains = function(searchString, position) {
        return String.prototype.indexOf.call(this, searchString, position) > -1;
    };
    // ES6 Map Symbol playfill
    require('es6-map/implement');
    require('es6-symbol/implement');
});
