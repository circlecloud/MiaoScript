/**
 * 控制台输出类
 */
/*global base*/
(function (global) {
    var Arrays = Java.type('java.util.Arrays');
    var Level = Java.type('java.util.logging.Level');
    global.ConsoleDefault = function ConsoleDefault(name) {
        Object.defineProperty(this, 'name', {
            get: function () {
                return this._name;
            }.bind(this),
            set: function (name) {
                this._name = name ? '[' + name + '] ' : '';
                // noinspection JSUnusedGlobalSymbols
                this.prefix = name ? '§6[§cMS§6][§b' + name + '§6]§r ' : '§6[§bMiaoScript§6]§r ';
            }.bind(this)
        });
        this.name = name;
        this.log = this.info = function () {
            log.info(this.name + Array.prototype.join.call(arguments, ' '));
        };
        // noinspection JSUnusedGlobalSymbols
        this.warn = function () {
            log.warning(this.name + Array.prototype.join.call(arguments, ' '));
        };
        this.error = function () {
            log.log(Level.SEVERE, this.name + Array.prototype.join.call(arguments, ' '));
        };
        this.debug = function () {
            log.info(this.name + '[DEBUG] ' + Array.prototype.join.call(arguments, ' '));
        };
        this.debug = global.debug ? this.debug : global.noop;
        this.sender = this.info;
        this.console = this.info;
        this.object = function (obj) {
            for (var i in obj) {
                this.log(i, '=>', obj[i])
            }
        };
        this.ex = function (message, ex) {
            if (!ex) {
                this.console('§4' + message);
                ex = message;
            } else {
                this.console('§4' + message + ' ' + ex);
            }
            var track = ex.getStackTrace();
            if (track.class) {
                track = Arrays.asList(track)
            }
            track.forEach(function (stack) {
                if (stack.className.startsWith('<')) {
                    this.console('    §e位于§c', stack.fileName, '=>§c', stack.methodName, '§4行', stack.lineNumber);
                } else {// %s.%s(§4%s:%s§c)
                    this.console('    §e位于§c', stack.className + '.' + stack.methodName + '(§4' + stack.fileName + ':' + stack.lineNumber + '§c)');
                }
            }.bind(this));
        };
    };
    global.Console = ConsoleDefault;
})(global);