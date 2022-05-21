/// <reference path="./index.d.ts" />
// @ts-check
(
    /**
     * @param {{ 
     * info: (arg0: string) => void; 
     * warn: (arg0: string) => void;
     * debug: (arg0: string) => void;
     * error: (arg0: string) => void;
     * warning: (arg0: string) => void;
     * }} logger
     */
    function (logger) {
        function log() {
            logger.info(Array.prototype.join.call(arguments, ' '))
        }
        function warn() {
            logger.warn(Array.prototype.join.call(arguments, ' '))
        }
        function debug() {
            logger.debug(Array.prototype.join.call(arguments, ' '))
        }
        function error() {
            logger.error(Array.prototype.join.call(arguments, ' '))
        }
        function warning() {
            logger.warning(Array.prototype.join.call(arguments, ' '))
        }
        /**
         * @param {string} prefix
         */
        function _proxy(prefix) {
            return function () {
                log('[' + prefix + ']', Array.prototype.join.call(arguments, ' '))
            }
        }
        var logProxy = {
            log: log,
            info: log,
            ex: log,
            trace: global.ScriptEngineLoggerLevel === "trace" ? _proxy('TRACE') : global.noop,
            debug: global.debug ? logger.debug ? debug : _proxy('DEBUG') : global.noop,
            warn: _proxy('WARN'),
            error: _proxy('ERROR')
        }
        if (logger.warn) {
            logProxy.warn = warn
        }
        if (logger.warning) {
            logProxy.warn = warning
        }
        if (logger.error) {
            logProxy.error = error
        }
        return logProxy
    })
