/**
 * 补丁和方法扩展
 */

(function () {
    // Java格式化方法
    var str = Java.type('java.lang.String');
    String.prototype.format = function () {
        return str.format(this, Array.prototype.slice.call(arguments, 0))
    };

    // JSON快捷方法
    Object.prototype.toJson = function () {
        return JSON.stringify(this);
    };

    // YAML快速生成
    var yaml = require('modules/yaml');
    Object.prototype.toYaml = function () {
        return yaml.safeDump(this);
    }
})();
