// @ts-check
(
    /**
     * @param {{ info: (arg0: string) => void; }} logger
     */
    function (logger) {
        function log() {
            logger.info(Array.prototype.join.call(arguments, ' '))
        }
        /**
         * @param {string} prefix
         */
        function _proxy(prefix) {
            return function () {
                log('[' + prefix + ']', Array.prototype.join.call(arguments, ' '))
            }
        }
        return {
            log: log,
            info: log,
            ex: log,
            // @ts-ignore
            trace: global.level === "trace" ? _proxy('TRACE') : global.noop,
            // @ts-ignore
            debug: global.debug ? _proxy('DEBUG') : global.noop,
            warn: _proxy('WARN'),
            error: _proxy('ERROR')
        };
    })
