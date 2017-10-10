/**
 * 控制台输出类
 */
/*global base*/
var log = base.getLog().static;
var Level = Java.type('java.util.logging.Level');
var console = {
    log: function () {
        log.i(arguments.join(' '));
    },
    warn: function () {
        log.w(arguments.join(' '));
    },
    error: function () {
        log.log(Level.SEVERE, arguments.join(' '));
    },
    debug: function () {
        log.d(arguments.join(' '));
    }
};
global.console = console;