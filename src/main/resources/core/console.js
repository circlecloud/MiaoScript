/**
 * 控制台输出类
 */
/*global base*/
var log = base.getLog().static;
(function(global){
    var Level = Java.type('java.util.logging.Level');
    var Console = function (name) {
        Object.defineProperty(this, 'name', {
            get: function () {
                return this._name;
            }.bind(this),
            set: function (name) {
                this._name = name ? '[' + name + '] ' : '';
            }.bind(this)
        });
        this.name = name;
        this.log = function () {
            log.i(this.name + Array.prototype.join.call(arguments, ' '));
        },
        this.warn = function () {
            log.w(this.name + Array.prototype.join.call(arguments, ' '));
        },
        this.error = function () {
            log.log(Level.SEVERE, this.name + Array.prototype.join.call(arguments, ' '));
        },
        this.debug = function () {
            log.d(this.name + Array.prototype.join.call(arguments, ' '));
        }
    }
    global.Console = Console;
    global.console = new Console();
})(global)