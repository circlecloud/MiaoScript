'use strict';
/**
 * Hello Wrold 测试插件
 */

var papi = require("modules/ext/papi");
var event = require('modules/event');
var join;
/*global Java, base, module, exports, require*/
var description = {
    name: 'HelloWorld',
    version: '1.0'
};

function load() {
    log.i('载入 Hello Wrold 测试插件!');
}

function enable() {
    log.i('启用 Hello Wrold 测试插件!');
    join = event.on('playerloginevent', function (event) {
        // noinspection JSUnresolvedVariable
        event.player.sendMessage(papi.$(event.player, "§a欢迎来到 §bMiaoScript §a的世界! 当前在线: %server_onlone%"));
    });
}

function disable() {
    log.i('卸载 Hello Wrold 测试插件!');
    event.off(join);
}

exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};