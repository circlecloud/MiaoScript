'use strict';
/**
 * Hello Wrold 测试插件
 */
/*global Java, base, module, exports, require*/

var event = require('modules/event');
var cmd = require('modules/command');
var join;

var description = {
    name: 'HelloWorld',
    version: '1.0'
};

function load() {
    console.log('载入 Hello Wrold 测试插件!');
}

function enable() {
    console.log('启用 Hello Wrold 测试插件!');
    join = event.on('playerloginevent', function join(event) {
        // noinspection JSUnresolvedVariable
        log.d('玩家 %s 触发事件 %s', event.player.name, event.name);
        setTimeout(function () {
            // noinspection JSUnresolvedVariable
            event.player.sendMessage(require("plugins/ext/papi").$(event.player, "§a欢迎来到 §bMiaoScript §a的世界! 当前在线: %server_online%"));
        }, 10);
    });
    cmd.on(module.exports, 'hello', {
        cmd: function (sender, command, args) {
            console.log(command, args);
            return true;
        },
        tab: function (sender, command, args) {
            return 'test';
        }
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