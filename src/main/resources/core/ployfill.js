(function(root, logger) {
    global.root = root;
    global.noop = global.engineDisable = function() { };
    // disable 
    global.engineLoad = load;
    global.load = function __PreventGlobalLoadFunction__() {
        throw new Error('Internal engine system not allow use `load` function!');
    };
    global.console = engineLoad(global.root + '/core/console.js')(logger);
    global.require = engineLoad(global.root + '/core/require.js')(root);
    String.prototype.contains = function(searchString/*, position*/) {
        return String.prototype.indexOf.call(this, searchString, arguments[1]) > -1;
    };
    require('es6-map/implement');
    require('es6-symbol/implement');
});
