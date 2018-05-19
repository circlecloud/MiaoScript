'use strict';
/**
 * MiaoScript Task处理类
 * @namespace plugin.configFile.parentFile, command.enable, permission.enable
 */
/*global Java, base, module, exports, require*/
function TaskHandlerDefault() {
}
var TaskHandler = Object.assign(new TaskHandlerDefault(), requireInternal('task'));

exports = module.exports = TaskHandler;
