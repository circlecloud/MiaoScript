/**
 * 补丁和方法扩展
 */

(function(){
    // JSON快捷方法
    Object.prototype.toJson = function(){ return JSON.stringify(this); }

    // YAML快速生成
    var yaml = require('modules/yaml');
    Object.prototype.toYaml = function(){ return yaml.safeDump(this); }
})();
