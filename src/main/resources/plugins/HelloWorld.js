'use strict';
/**
 * Hello Wrold 测试插件
 */
/*global Java, base, module, exports, require*/

var event = require('api/event');
var command = require('api/command');
var fs = require('fs');
var papi = require('./ext/papi');
var join;

var description = {
    name: 'HelloWorld',
    version: '1.0',
    commands: {
        'hello': {
            description: 'HelloWorld主命令'
        }
    }
};

// function load() {
//     console.log('载入 Hello Wrold 测试插件!');
// }

function enable() {
    command.on(this, 'hello', {
        cmd: function (sender, command, args) {
            load(fs.file(root, 'test.js'));
            return true;
        }
    });
    console.log('启用 Hello Wrold 测试插件!');
    join = event.on(this, 'playerloginevent', function join(event) {
        // noinspection JSUnresolvedVariable
        console.debug('玩家', event.player.name, "触发事件", event.name);
        setTimeout(function () {
            // noinspection JSUnresolvedVariable
            event.player.sendMessage(papi.$(event.player, "§a欢迎来到 §bMiaoScript §a的世界! 当前在线: %server_online%"));
        }, 10);
    });
}

function disable() {
    console.log('卸载 Hello Wrold 测试插件!');
    // 可以不用关闭事件 程序将自动处理
    // event.off(join);
}

module.exports = {
    description: description,
    // load: load,
    enable: enable,
    disable: disable
};