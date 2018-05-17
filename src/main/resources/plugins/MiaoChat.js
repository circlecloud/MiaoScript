'use strict';
/**
 * MiaoChat 喵式聊天插件
 */
/*global Java, base, module, exports, require*/

var event = require('api/event');
var command = require('api/command');

var tellraw = require('tellraw');
var papi = require('papi');
var utils = require('utils');

var Player;

var description = {
    name: 'MiaoChat',
    version: '1.0',
    author: '喵呜',
    commands: {
        'mchat': {
            description: 'MiaoChat登录命令'
        }
    },
    permissions: {
        'MiaoChat.default': {
            default: true,
            description: '默认权限 赋予玩家'
        },
        'MiaoChat.admin': {
            default: false,
            description: '管理权限'
        }
    },
    config: {
        Version: "1.8.5",
        BungeeCord: true,
        Server: "生存服",
        ChatFormats: {
            "default": {
                "index": 50,
                "permission": "MiaoChat.default",
                "range": 0,
                "format": "[world][player]: ",
                "item": true,
                "itemformat": "&6[&b%s&6]&r"
            },
            "admin": {
                "index": 49,
                "permission": "MiaoChat.admin",
                "format": "[admin][world][player][help]: ",
                "range": 0,
                "item": true,
                "itemformat": "&6[&b%s&6]&r"
            }
        },
        StyleFormats: {
            "world": {
                "text": "&6[&a%player_world%&6]",
                "hover": [
                    "&6当前所在位置:",
                    "&6世界: &d%player_world%",
                    "&6坐标: &aX:%player_x% Y: %player_y% Z: %player_z%",
                    "",
                    "&c点击即可TP我!"
                ],
                "click": {
                    "type": "COMMAND",
                    "command": "/tpa %player_name%"
                }
            },
            "player": {
                "text": "&b%player_name%",
                "hover": [
                    "&6玩家名称: &b%player_name%",
                    "&6玩家等级: &a%player_level%",
                    "&6玩家血量: &c%player_health%",
                    "&6玩家饥饿: &d%player_food_level%",
                    "&6游戏模式: &4%player_gamemode%",
                    "",
                    "&c点击与我聊天"
                ],
                "click": {
                    "type": "SUGGEST",
                    "command": "/tell %player_name%"
                }
            },
            "admin": {
                "text": "&6[&c管理员&6]"
            },
            "help": {
                "text": "&4[求助]",
                "hover": [
                    "点击求助OP"
                ],
                "click": {
                    "type": "COMMAND",
                    "command": "管理员@%player_name% 我需要你的帮助!"
                }
            }
        }
    }
};

var chat_formats;
var style_formats;

function load() {
    chat_formats = Object.values(self.config.ChatFormats);
    chat_formats.sort(utils.compare('index'));
    initFormat(chat_formats);
    style_formats = self.config.StyleFormats;
}

// 用于匹配 '[xx]' 聊天格式
var FORMAT_PATTERN = /[\[]([^\[\]]+)[\]]/ig;

function initFormat(chat_formats) {
    chat_formats.forEach(function (chat_format) {
        var chat_format_str = chat_format.format;
        var temp = [];
        var r;
        while (r = FORMAT_PATTERN.exec(chat_format_str)) {
            temp.push(r[1]);
        }
        var format_list = [];
        temp.forEach(function splitStyle(t) {
            var arr = chat_format_str.split('[' + t + ']', 2);
            if (arr[0]) {
                format_list.push(arr[0]);
            }
            format_list.push(t);
            chat_format_str = arr[1];
        });
        if (chat_format_str) {
            format_list.push(chat_format_str);
        }
        chat_format.format_list = format_list;
    })
}

function enable() {
    registerCommand();
    registerEvent();
}

function registerCommand() {
    command.on(self, 'mchat', {
        cmd: mainCommand
    });
}

// noinspection JSUnusedLocalSymbols
function mainCommand(sender, command, args) {
    return true;
}

function registerEvent() {
    switch (DetectServerType) {
        case ServerType.Bukkit:
            event.on(self, 'AsyncPlayerChatEvent', handlerBukkitChat);
            break;
        case ServerType.Sponge:
            Player = org.spongepowered.api.entity.living.player.Player;
            event.on(self, 'MessageChannelEvent.Chat', handlerSpongeChat);
            break;
    }
}

function handlerBukkitChat(event) {
    sendChat(event.player, event.message, function () {
        event.setCancelled(true);
    });
}

function handlerSpongeChat(event) {
    var player = event.getCause().first(Player.class).orElse(null);
    if (player == null) {
        return;
    }
    var plain = event.getRawMessage().toPlain();
    if (plain.startsWith(tellraw.duplicateChar)) {
        return;
    }
    sendChat(player, plain, function () {
        event.setMessageCancelled(true)
    });
}

function sendChat(player, plain, callback) {
    var chat_format = getChatFormat(player);
    if (!chat_format) {
        console.debug('未获得用户', player.name, '的 ChatRule 跳过执行...');
        return;
    }
    callback();
    var tr = tellraw.create();
    chat_format.format_list.forEach(function setStyle(format) {
        var style = style_formats[format];
        if (style) {
            tr.then(replace(player, style.text));
            if (style.hover) {
                tr.tip(replace(player, style.hover));
            }
            if (style.click && style.click.type && style.click.command) {
                var command = replace(player, style.click.command);
                switch (style.click.type) {
                    case "COMMAND":
                        tr.command(command);
                        break;
                    case "OPENURL":
                        tr.link(command);
                        break;
                    case "SUGGEST":
                        tr.suggest(command);
                        break;
                    default:
                }
            }
        } else {
            tr.then(replace(player, format));
        }
    });
    tr.then(replace(player, plain)).sendAll();
}

function getChatFormat(player) {
    for (var i in chat_formats) {
        var format = chat_formats[i];
        if (player.hasPermission(format.permission)) {
            return format;
        }
    }
    return null;
}

function replace(player, target) {
    if (toString.call(target) === "[object Array]") {
        for (var i in target) {
            target[i] = replaceStr(player, target[i]);
        }
    } else {
        target = replaceStr(player, target);
    }
    return target;
}

function replaceStr(player, target) {
    return papi.$(player, target);
}

function disable() {
    console.log('卸载', description.name, '插件!');
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};
