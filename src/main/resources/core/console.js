/**
 * 控制台输出类
 */
/*global base*/
(function(global) {
    var Arrays = Java.type('java.util.Arrays');
    var Level = Java.type('java.util.logging.Level');
    global.ConsoleDefault = function ConsoleDefault(name) {
        Object.defineProperty(this, 'name', {
            get: function() {
                return this._name;
            }.bind(this),
            set: function(name) {
                this._name = name ? '[' + name + '] ' : '';
                // noinspection JSUnusedGlobalSymbols
                this.prefix = name ? '§6[§cMS§6][§b' + name + '§6]§r ' : '§6[§bMiaoScript§6]§r ';
            }.bind(this)
        });
        this.name = name;
        this.log = this.info = function() {
            log.info(this.name + Array.prototype.join.call(arguments, ' '));
        };
        // noinspection JSUnusedGlobalSymbols
        this.warn = function() {
            log.warning(this.name + Array.prototype.join.call(arguments, ' '));
        };
        this.error = function() {
            log.log(Level.SEVERE, this.name + Array.prototype.join.call(arguments, ' '));
        };
        this.debug = function() {
            log.info(this.name + '[DEBUG] ' + Array.prototype.join.call(arguments, ' '));
        };
        this.debug = global.debug ? this.debug : global.noop;
        this.sender = this.info;
        this.console = this.info;
        this.object = function(obj) {
            for (var i in obj) {
                this.log(i, '=>', obj[i])
            }
        };
        this.ex = function(message, ex) {
            switch (toString.call(message)) {
                case "[object String]":
                    message = message + ' ' //message = 'xxxx' ex =Error
                    break
                case "[object Error]":
                    ex = message // message = Error ex=null
                    message = ''
                    break
            }
            this.console('§4 ' + message + ex)
            this.stack(ex).forEach(function(line) {
                this.console(line)
            })
        };
        this.stack = function(ex) {
            var track = ex ? ex.getStackTrace() : new Error().getStackTrace();
            var cache = ['§4' + ex];
            if (track.class) {
                track = Arrays.asList(track)
            }
            track.forEach(function(stack) {
                if (stack.className.startsWith('<')) {
                    var fileName = stack.fileName
                    fileName = fileName.indexOf('runtime') > -1 ? fileName.split('runtime')[1] : fileName;
                    cache.push('    §e->§c %s => §4%s:%s'.format(fileName, stack.methodName, stack.lineNumber))
                } else {// %s.%s(§4%s:%s§c)
                    var className = stack.className
                    className = className.startsWith('jdk.nashorn.internal.scripts') ? className.substr(className.lastIndexOf('$') + 1) : className
                    cache.push('    §e->§c %s.%s(§4%s:%s§c)'.format(className, stack.methodName, stack.fileName, stack.lineNumber));
                }
            });
            return cache;
        }
    };
    global.Console = ConsoleDefault;
})(global);