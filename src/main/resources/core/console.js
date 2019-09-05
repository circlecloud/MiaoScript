(function(logger) {
    function log() {
        logger.info(Array.prototype.join.call(arguments, ' '))
    }
    function _proxy(prefix) {
        return function() {
            log('[' + prefix + ']', Array.prototype.join.call(arguments, ' '))
        }
    }
    return {
        log: log,
        info: log,
        debug: global.debug ? _proxy('DEBUG') : global.noop,
        warn: _proxy('WARN'),
        error: _proxy('ERROR')
    };
})
