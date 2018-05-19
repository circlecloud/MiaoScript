'use strict';
/**
 * MiaoAuth简易登录系统
 */
/*global Java, base, module, exports, require*/

var event = require('api/event');
var wrapper = require('api/wrapper');
var command = require('api/command');
var server = require('api/server');
var fs = require('fs');

var description = {
    name: 'MiaoAuth',
    version: '1.0',
    commands: {
        'l': {
            description: 'MiaoAuth登录命令'
        },
        'r': {
            description: 'MiaoAuth注册命令'
        }
    }
};

function load() {
    console.log('载入 MiaoAuth 插件!');
}

function enable() {
    command.on(this, 'l', {
        cmd: function (sender, command, args) {
            return true;
        }
    });
    command.on(this, 'r', {
        cmd: function (sender, command, args) {
            return true;
        }
    });
    console.log('启用 MiaoAuth 测试插件!');
    switch (DetectServerType) {
        case ServerType.Bukkit:
            event.on(this, 'playerloginevent', function join(event) {
                send(wrapper.player(event.player));
            });
            break;
        case ServerType.Sponge:
            event.on(this, 'clientconnectionevent.join', function join(event) {
                send(wrapper.player(event.targetEntity));
            });
            break;
    }
}

function send(player) {
    setTimeout(function sendMessage() {
        player.sendMessage('§a输入 /l <密码> 以登录!');
    }, 1000);
}

function disable() {
    console.log('卸载 MiaoAuth 测试插件!');
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};
