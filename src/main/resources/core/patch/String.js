/**
 * 补丁和方法扩展
 */
(function () {
    // Java格式化方法
    var str = Java.type('java.lang.String');
    String.prototype.format = function () {
        return str.format(this, Array.prototype.slice.call(arguments, 0))
    };
})();
