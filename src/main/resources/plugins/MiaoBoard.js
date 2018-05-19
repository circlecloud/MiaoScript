'use strict';
/**
 * MiaoBoard 喵式聊天插件
 */
/*global Java, base, module, exports, require*/
var task = require('api/task');
var event = require('api/event');
var server = require('api/server');
var command = require('api/command');

var papi = require('papi');

var Scoreboard = Java.type('org.spongepowered.api.scoreboard.Scoreboard');
var Objective = Java.type('org.spongepowered.api.scoreboard.objective.Objective');
var Criteria = Java.type('org.spongepowered.api.scoreboard.critieria.Criteria');
var Text = Java.type('org.spongepowered.api.text.Text');
var DisplaySlots = Java.type('org.spongepowered.api.scoreboard.displayslot.DisplaySlots');

var Player;

var boards = [];

var description = {
    name: 'MiaoBoard',
    version: '1.0',
    author: '喵呜',
    commands: {
        'mboard': {
            description: '喵式记分板主命令'
        }
    },
    permissions: {
        'mb.default': {
            default: true,
            description: '默认权限 赋予玩家'
        },
        'mb.admin': {
            default: false,
            description: '管理权限'
        }
    },
    config: {
        "Version": 2,
        "UpdateTime": 10,
        "DisableWorld": [
            "WorldName"
        ],
        "Boards": {
            "default": {
                "index": 50,
                "time": {
                    "start": "2016-01-01 00:00:00",
                    "end": "2020-01-01 00:00:00"
                },
                "title": "玩家信息",
                "permission": "mb.default",
                "lines": [
                    "&6名 称: &a%player_displayname%",
                    "&6世 界: &b%player_world%",
                    "&6位 置: &3%player_x%,%player_y%,%player_z%",
                    "&6等 级: &e%player_level%",
                    "&6血 量: &c%player_health%",
                    "&6饥 饿: &d%player_food_level%",
                    "&6模 式: &4%player_gamemode%"
                ]
            },
            "admin": {
                "index": 49,
                "title": "服务器信息",
                "permission": "mb.reload",
                "lines": [
                    "&6名 称: &aMiaoBoard",
                    "&6版 本: &b" + this.version,
                    "&6作 者: &cMiaoWoo",
                    "&6人 数: &c%server_online%/%server_max%",
                    "&6内 存: &a%server_ram_used%/%server_ram_total%/%server_ram_max%"
                ]
            }
        }
    }
}

var update_task;
var board_formats;

function load() {
    board_formats = self.config.Boards;
}

function enable() {
    registerCommand();
    registerEvent();
    registerTask();
    server.players(function (player) {
        boards[player.name] = new MiaoBoard(player);
    })
}

function registerCommand() {
    command.on(self, 'mboard', {
        cmd: mainCommand
    });
}

function mainCommand(sender, command, args) {
    boards[sender.name].update('MiaoBoard', ['第一行', '第二行', '第三行']);
}

function registerEvent() {
    switch (DetectServerType) {
        case ServerType.Bukkit:
            event.on(self, 'PlayerLoginEvent', handlerPlayerJoin);
            break;
        case ServerType.Sponge:
            Player = org.spongepowered.api.entity.living.player.Player;
            event.on(self, 'ClientConnectionEvent.Join', handlerPlayerJoin);
            event.on(self, 'ClientConnectionEvent.Disconnect', handlerPlayerQuit);
            break;
    }
}

function handlerPlayerJoin(event) {
    var player = event.player || event.targetEntity;
    boards[player.name] = new MiaoBoard(player);
}

function handlerPlayerQuit(event) {
    var player = event.player || event.targetEntity;
    delete boards[player.name];
}

function registerTask() {
    update_task = task.timerAsync(updateBoard, self.config.UpdateTime);
}

function updateBoard() {
    for (var i in boards) {
        var player = server.player(i);
        if (player.isOnline()) {
            var format = getBoardFormat(player);
            if (format) {
                boards[i].update(format.title, papi.replace(player, format.lines));
            } else {
                boards[i].clear();
            }
        } else {
            delete boards[i];
        }
    }
}

function getBoardFormat(player) {
    for (var i in board_formats) {
        var format = board_formats[i];
        if (player.hasPermission(format.permission)) {
            return format;
        }
    }
    return null;
}

function disable() {
    update_task.cancel();
}

function MiaoBoard(player) {
    var uuid = player.uniqueId;
    var scoreboard = Scoreboard.builder().build();
    var sidebar = Objective.builder().criterion(Criteria.DUMMY).displayName(Text.EMPTY).name("Sidebar").build();
    var origin = [];

    scoreboard.addObjective(sidebar);
    player.setScoreboard(scoreboard);

    this.update = function (title, lines) {
        sidebar.scores.values().forEach(function removeScore(score) {
            sidebar.removeScore(score)
        })
        var max = lines.length;
        var i = 0;
        sidebar.setDisplayName(Text.of(title));
        lines.forEach(function addScore(line) {
            sidebar.getOrCreateScore(Text.of(line)).setScore(max - i++);
        })
        scoreboard.updateDisplaySlot(sidebar, DisplaySlots.SIDEBAR);
    }

    this.clear = function () {
        player.setScoreboard(Scoreboard.builder().build());
    }
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};