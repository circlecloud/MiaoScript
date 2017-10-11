/**
 * 控制台输出类
 */
/*global base*/
var log = base.getLog().static;
var Level = Java.type('java.util.logging.Level');
var console = {
    log: function () {
        log.i(Array.prototype.join.call(arguments, ' '));
    },
    warn: function () {
        log.w(Array.prototype.join.call(arguments, ' '));
    },
    error: function () {
        log.log(Level.SEVERE, Array.prototype.join.call(arguments, ' '));
    },
    debug: function () {
        log.d(Array.prototype.join.call(arguments, ' '));
    }
};
global.console = console;