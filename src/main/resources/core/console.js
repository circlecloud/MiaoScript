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
        this.ex = function(ex) {
            this.stack(ex).forEach(function(line) {
                this.console(line)
            }.bind(this))
        };
        this.stack = function(ex) {
            // var exType = toString.call(ex)
            // if (exType !== "[object Error]") {
            //     console.console('§6[WARN] Unknown Type', exType, ex)
            //     ex.printStackTrace();
            //     return []
            // }
            var stack = ex.getStackTrace();
            var cache = ['§4' + ex];
            if (stack.class) {
                stack = Arrays.asList(stack)
            }
            stack.forEach(function(trace) {
                if (trace.className.startsWith('<')) {
                    var fileName = trace.fileName
                    fileName = fileName.indexOf('runtime') > -1 ? fileName.split('runtime')[1] : fileName;
                    cache.push('    §e->§c %s => §4%s:%s'.format(fileName, trace.methodName, trace.lineNumber))
                } else {// %s.%s(§4%s:%s§c)
                    var className = trace.className
                    className = className.startsWith('jdk.nashorn.internal.scripts') ? className.substr(className.lastIndexOf('$') + 1) : className
                    cache.push('    §e->§c %s.%s(§4%s:%s§c)'.format(className, trace.methodName, trace.fileName, trace.lineNumber));
                }
            });
            return cache;
        }
    };
    global.Console = ConsoleDefault;
})(global);