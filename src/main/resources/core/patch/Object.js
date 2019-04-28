/**
 * 补丁和方法扩展
 */

(function() {
    // Object.assign Polyfill
    if (!Object.assign) {
        Object.defineProperty(Object, "assign", {
            enumerable: false,
            value: function(target) {
                "use strict";
                if (target === undefined || target === null)
                    throw new TypeError("Cannot convert first argument to object");
                var to = Object(target);
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[i];
                    if (nextSource === undefined || nextSource === null) continue;
                    var keysArray = Object.keys(Object(nextSource));
                    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                        var nextKey = keysArray[nextIndex];
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
                    }
                }
                return to;
            }
        });
    }
    // Object.values Polyfill
    if (!Object.values) {
        Object.defineProperty(Object, "values", {
            enumerable: false,
            value: function(target) {
                "use strict";
                var values = [];
                for (var key in target) {
                    var desc = Object.getOwnPropertyDescriptor(target, key);
                    if (desc !== undefined && desc.enumerable) values.push(target[key]);
                }
                return values;
            }
        });
    }

    // JSON快捷方法
    if (!Object.toJson) {
        Object.defineProperty(Object.prototype, "toJson", {
            enumerable: false,
            value: function() {
                return JSON.stringify(this);
            }
        });
    }
})();
