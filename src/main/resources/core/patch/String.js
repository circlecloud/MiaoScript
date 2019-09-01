/**
 * 补丁和方法扩展
 */
(function() {
    // Java格式化方法
    var str = Java.type('java.lang.String');
    String.prototype.format = function() {
        return str.format(this, Array.prototype.slice.call(arguments, 0))
    };
    var indexOf = String.prototype.indexOf;
    String.prototype.contains = function(searchString/*, position*/) {
        return indexOf.call(this, searchString, arguments[1]) > -1;
    };
})();
