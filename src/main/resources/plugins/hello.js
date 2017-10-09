'use strict';
/**
 * Hello Wrold 测试插件
 */
/*global Java, base, module, exports, require*/

var papi = require("modules/ext/papi");
var event = require('modules/event');
var join;

var description = {
    name: 'HelloWorld',
    version: '1.0'
};

function load() {
    log.i('载入 Hello Wrold 测试插件!');
}

function enable() {
    log.i('启用 Hello Wrold 测试插件!');
    join = event.on('playerloginevent', function join(event) {
        // noinspection JSUnresolvedVariable
        log.d('玩家 %s 触发事件 %s', event.player.name, event.name);
        setTimeout(function () {
            // noinspection JSUnresolvedVariable
            event.player.sendMessage(papi.$(event.player, "§a欢迎来到 §bMiaoScript §a的世界! 当前在线: %server_online%"));
        }, 10);
    });
}

function disable() {
    log.i('卸载 Hello Wrold 测试插件!');
    event.off(join);
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};