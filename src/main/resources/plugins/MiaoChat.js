'use strict';
/**
 * MiaoChat 喵式聊天插件
 */
/*global Java, base, module, exports, require*/

var event = require('api/event');
var wrapper = require('api/wrapper');
var command = require('api/command');
var server = require('api/server');
var fs = require('fs');

var chat = require('api/chat');

var utils = require('utils')

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
        "Version":"1.8.5",
        "BungeeCord":true,
        "Server":"生存服",
        "ChatFormats":{
            "default":{
                "index":50,
                "permission":"MiaoChat.default",
                "range":0,
                "format":"[world][player]: ",
                "item":true,
                "itemformat":"&6[&b%s&6]&r"
            },
            "admin":{
                "index":49,
                "permission":"MiaoChat.admin",
                "format":"[admin][world][player][help]: ",
                "range":0,
                "item":true,
                "itemformat":"&6[&b%s&6]&r"
            }
        },
        StyleFormats: {
            "world":{
                "text":"&6[&a%player_world%&6]",
                "hover":[
                    "&6当前所在位置:",
                    "&6世界: &d%player_world%",
                    "&6坐标: &aX:%player_x% Y: %player_y% Z: %player_z%",
                    "",
                    "&c点击即可TP我!"
                ],
                "click":{
                    "type":"COMMAND",
                    "command":"/tpa %player_name%"
                }
            },
            "player":{
                "text":"&b%player_name%",
                "hover":[
                    "&6玩家名称: &b%player_name%",
                    "&6玩家等级: &a%player_level%",
                    "&6玩家血量: &c%player_health%",
                    "&6玩家饥饿: &d%player_food_level%",
                    "&6游戏模式: &4%player_gamemode%",
                    "",
                    "&c点击与我聊天"
                ],
                "click":{
                    "type":"SUGGEST",
                    "command":"/tell %player_name%"
                }
            },
            "admin":{
                "text":"&6[&c管理员&6]"
            },
            "help":{
                "text":"&4[求助]",
                "hover":[
                    "点击求助OP"
                ],
                "click":{
                    "type":"COMMAND",
                    "command":"管理员@%player_name% 我需要你的帮助!"
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
        var r = [];
        while(r = FORMAT_PATTERN.exec(chat_format_str)) {   
            temp.push(r[1]);
        }
        var format_list = []
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
        cmd: mchat
    });
}

function mchat(sender, command, args) {
    return true;
}

function registerEvent() {
    switch (DetectServerType) {
        case ServerType.Bukkit:
            event.on(self, 'AsyncPlayerChatEvent', handlerBukkitChat);
            break;
        case ServerType.Sponge:
            event.on(self, 'MessageChannelEvent.Chat', handlerSpongeChat);
            break;
    }
}

var DuplicateChar = '§卐';

function handlerBukkitChat(event) {
    sendChat(event.player, event.message, function() { event.setCancelled(true); });
}

function handlerSpongeChat(event) {
    var player = event.getCause().first(org.spongepowered.api.entity.living.player.Player.class).orElse(null);
    if (player == null) { return; }
    var plain = event.getRawMessage().toPlain();
    if (plain.startsWith(DuplicateChar)) {
        return;
    }
    sendChat(player, plain, function() { event.setMessageCancelled(true) });
}

function sendChat(player, plain, callback) {
    var chat_format = getChatFormat(player);
    if (!chat_format) {
        console.debug('未获得用户', player.name, '的 ChatRule 跳过执行...')
        return;
    }
    callback();
    var tr = new Tellraw().then(DuplicateChar);
    chat_format.format_list.forEach(function setStyle(format) {
        var style = style_formats[format];
        if (style) {
           tr.then(style.text);
           if (style.hover) {
               tr.tip(style.hover);
           }
           if (style.click && style.click.type && style.click.command) {
               switch (style.click.type) {
                   case "COMMAND":
                       tr.command(style.click.command);
                       break;
                   case "OPENURL":
                       tr.link(style.click.command);
                       break;
                   case "SUGGEST":
                       tr.suggest(style.click.command);
                       break;
                   default:
               }
           }
        } else {
            tr.then(format);
        }
    })
    tr.then(plain).sendAll();
}

function getChatFormat(player) {
    for (var i in chat_formats){
        var format = chat_formats[i];
        if (player.hasPermission(format.permission)) {
            return format;
        }
    }
    return null;
}

function replace(target) {
    if (toString.call(target) === "[object Array]") {
        for (var i in target) {
            target[i] = replaceStr(target[i]);
        }
    } else {
        target = replaceStr(target);
    }
    return target;
}

function replaceStr(target) {
    return target;
}

function disable() {
    console.log('卸载', description.name, '插件!');
}

/*global Java, base, module, exports, require*/
var ChatMessagePart = function () {
    var text;
    var clickEventAction;
    var clickEventValue;
    var hoverEventAction;
    var hoverEventValue;
    var insertion;

    this.click = function (action, value) {
        this.clickEventAction = action;
        this.clickEventValue = value;
    }

    this.hover = function (action, value) {
        this.hoverEventAction = action;
        this.hoverEventValue = value;
        console.log(this.toJson())
    }

    this.convert = function () {
        var str = {};
        if (this.text) {
            str.text = this.text;
        }
        if (this.clickEventAction) {
            str.clickEvent = {
                "action": this.clickEventAction,
                "value": this.clickEventValue
            }
        }
        if (this.hoverEventAction) {
            str.hoverEvent = {
                "action": this.hoverEventAction,
                "value": this.hoverEventValue
            }
        }
        if (this.insertion) {
            str.insertion = this.insertion;
        }
        return str;
    }
}

var Tellraw = function () {
    var parts = [new ChatMessagePart()];
    var self = this;
    var cache = null;

    this.then = function (part) {
        if (typeof part === "string") {
            var newPart = new ChatMessagePart();
            newPart.text = part;
            this.then(newPart);
            return self;
        }
        var last = this.latest();
        if (!last.text) {
            last.text = part.text;
        } else {
            parts.push(part);
        }
        this.cache = null;
    }

    this.text = function (text) {
        this.latest().text = text;
        return this;
    }

    this.tip = function (str) {
        if (toString.call(str) === "[object Array]") {
            str = str.join("\n");
        }
        this.latest().hover("show_text", str);
        return this;
    }

    this.item = function (str) {
        this.latest().hover("show_item", str);
        return this;
    }

    this.cmd = this.command = function (command) {
        this.latest().click("run_command", command);
        return this;
    }

    this.suggest = function (url) {
        this.latest().click("suggest_command", url);
        return this;
    }

    this.file = function (path) {
        this.latest().click("open_file", path);
        return this;
    }

    this.link = function (url) {
        this.latest().click("open_url", url);
        return this;
    }

    this.latest = function () {
        return parts[parts.length - 1];
    }

    this.json = function () {
        if (!this.cache) {
            var temp = [];
            parts.forEach(function (t) {
                temp.push(t.convert());
            })
            this.cache = JSON.stringify(temp);
            console.debug(this.cache);
        }
        return this.cache;
    }

    this.send = function (player) {
        chat.json(player, self.json());
    }
    
    this.sendAll = function () {
        server.players(function sendAllMessage(p) {
            self.send(p);
        })
    }
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};
