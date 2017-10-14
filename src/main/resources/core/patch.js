/**
 * 补丁和方法扩展
 */

// JSON快捷方法
Object.prototype.toJson = function(){ return JSON.stringify(this); }

// YAML快速生成
Object.prototype.toYaml = function(){ return require('modules/yaml').safeDump(plugin.config); }