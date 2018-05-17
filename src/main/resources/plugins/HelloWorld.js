'use strict';
/**
 * Hello Wrold 测试插件
 */
/*global Java, base, module, exports, require*/

var event = require('api/event');
var wrapper = require('api/wrapper');
var command = require('api/command');
var server = require('api/server');
var fs = require('fs');

var description = {
    name: 'HelloWorld',
    version: '1.0',
    commands: {
        'hello': {
            description: 'HelloWorld主命令'
        }
    }
};

function load() {
    console.log('载入 Hello Wrold 测试插件!');
}

function enable() {
    // noinspection JSUnusedLocalSymbols
    command.on(this, 'hello', {
        cmd: function (sender, command, args) {
            engineLoad(fs.file(root, 'test.js'));
            return true;
        }
    });
    console.log('启用 Hello World 测试插件!');
    switch (DetectServerType) {
        case ServerType.Bukkit:
            event.on(this, 'PlayerLoginEvent', function join(event) {
                send(event, wrapper.player(event.player));
            });
            break;
        case ServerType.Sponge:
            event.on(this, 'ClientConnectionEvent.Join', function join(event) {
                send(event, wrapper.player(event.targetEntity));
            });
            break;
    }
}

function send(event, player) {
    // noinspection JSUnresolvedVariable
    console.debug('玩家', player.getName(), "触发事件", event.class.simpleName);
    setTimeout(function () {
        // noinspection JSUnresolvedVariable
        player.sendMessage("§a欢迎来到 §bMiaoScript §a的世界! 当前在线: " + server.players().length)
    }, 10);
}

function disable() {
    console.log('卸载 Hello World 测试插件!');
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};
