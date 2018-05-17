'use strict';
/**
 * MiaoTag
 * 可兼容任何记分板
 */
/*global Java, base, module, exports, require*/
var event = require('api/event');
var bukkit = require('api/server');
var command = require('api/command');

var fakeTag;

var description = {
    name: 'MiaoTag',
    version: '1.1',
    author: '喵♂呜',
    config: {
        format: '§4§l❤'
    },
    commands: {
        'mtag': {
            description: 'MiaoTag主命令',
            usage: '',
            permission: 'MiaoTag.admin'
        }
    },
    permissions: {
        'MiaoTag.default': {
            default: true,
            description: '默认权限 赋予玩家'
        },
        'MiaoTag.admin': {
            default: false,
            description: '管理权限'
        }
    }
};

var config;

function load() {
    config = self.getConfig();
    fakeTag = new FakeTag(config.format);
}

function enable() {
    command.on(self, 'mtag', {
        cmd: function cmd(sender, command, args) {
            var subCommand = args[0];
            switch (subCommand) {
                case 'reload':
                    self.reloadConfig();
                    fakeTag = new FakeTag(config.format);
                    console.sender(sender, "§a配置文件重载完成!", "TEST");
                    break;
            }
        },
        tab: function tab(sender, command, args) {
            return ['reload'];
        }
    });
    bukkit.players(function (p) fakeTag.set(p));
    event.on(self, 'PlayerJoin', function (event) fakeTag.set(event.player));
    var entityUpdate = function (event) {
        var player = event.entity || event.player;
        if (player instanceof org.bukkit.entity.Player) {
            setTimeout(function () {
                fakeTag.update(player);
            }, 1);
        }
    };
    event.on(self, 'EntityRegainHealth', entityUpdate, false);
    event.on(self, 'EntityDamage', entityUpdate, false);
    event.on(self, 'EntityRegainHealth', entityUpdate, false);
    event.on(self, 'PlayerRespawn', entityUpdate, false);
    //event.on(this, 'playerquitevent', function quit(event) removeTask(event.player));
}

function disable() {
    fakeTag.disable();
}

function FakeTag(name) {
    // NMS CLASS
    var ScoreboardBaseCriteria = bukkit.nmsCls('ScoreboardBaseCriteria');
    var PacketPlayOutScoreboardScore = bukkit.nmsCls('PacketPlayOutScoreboardScore');
    var PacketPlayOutScoreboardObjective = bukkit.nmsCls('PacketPlayOutScoreboardObjective');
    var PacketPlayOutScoreboardDisplayObjective = bukkit.nmsCls('PacketPlayOutScoreboardDisplayObjective');

    var scoreboardManager = bukkit.$.scoreboardManager;
    var mainScoreboard = scoreboardManager.mainScoreboard.handle;

    try {
        // 注册tag对象
        mainScoreboard.registerObjective(name, new ScoreboardBaseCriteria(name));
    } catch (ex) {
        // ignore 忽略创建错误 eg: java.lang.IllegalArgumentException: An objective with the name 'xxxxx' already exists!
    }
    var objective = mainScoreboard.getObjective(name);

    // 缓存虚拟的tag包
    var cache = {
        objective: new PacketPlayOutScoreboardObjective(objective, 0),
        display: new PacketPlayOutScoreboardDisplayObjective(2, objective)
    };

    function sendPacket(player, p) {
        player.handle.playerConnection.sendPacket(p);
    }

    this.set = function (player) {
        sendPacket(player, cache.objective);
        sendPacket(player, cache.display);
        this.update(player);
    };

    this.update = function (player) {
        var score = mainScoreboard.getPlayerScoreForObjective(player.name, objective);
        score.setScore(player.getHealth());
        var scorePack = new PacketPlayOutScoreboardScore(score);
        //把其他玩家缓存的包发给这个玩家
        bukkit.players(function (t) {
            sendPacket(t, scorePack);
            if (t.name !== player.name) {
                var outher = mainScoreboard.getPlayerScoreForObjective(t.name, objective);
                outher.setScore(t.getHealth());
                sendPacket(player, new PacketPlayOutScoreboardScore(outher));
            }
        });
    };

    this.disable = function () {
        // 注销tag对象
        mainScoreboard.unregisterObjective(objective);
    }
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};