/**
 * Hello Wrold 测试插件
 */
'use strict';

var event = require('modules/event');
var joinCancel;
/*global Java, base, module, exports, require*/
exports.description = {
    name: 'HelloWorld'
};
exports.load = function () {
    log.i('载入 Hello Wrold 测试插件!');
};
exports.enable = function () {
    log.i('启用 Hello Wrold 测试插件!');
    joinCancel = event.on('playerloginevent', function (event) {
        // noinspection JSUnresolvedVariable
        event.player.sendMessage('§a欢迎来到 §bMiaoScript §a的世界!');
    });
};
exports.disable = function () {
    log.i('卸载 Hello Wrold 测试插件!');
    event.off(joinCancel);
};