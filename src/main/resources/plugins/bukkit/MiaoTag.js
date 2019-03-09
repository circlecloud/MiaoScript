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
    author: 'MiaoWoo',
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
}

function enable() {
    registryCommand()
    fakeTag = new FakeTag(config.format);
    registryEvent()
}

function registryCommand() {
    command.on(self, 'mtag', {
        cmd: function cmd(sender, command, args) {
            var subCommand = args[0];
            switch (subCommand) {
                case 'reload':
                    self.reloadConfig();
                    fakeTag = new FakeTag(config.format);
                    console.sender(sender, "§a配置文件重载完成!");
                    break;
            }
        },
        tab: function tab(sender, command, args) {
            return ['reload'];
        }
    });
}

function registryEvent() {
    bukkit.players(function(p) { fakeTag.set(p) });
    event.on(self, 'PlayerJoin', function(event) { fakeTag.set(event.player) });
    event.on(self, 'EntityRegainHealth', entityUpdate, false);
    event.on(self, 'EntityDamage', entityUpdate, false);
    event.on(self, 'EntityRegainHealth', entityUpdate, false);
    event.on(self, 'PlayerRespawn', entityUpdate, false);
}

function entityUpdate(event) {
    var player = event.entity || event.player;
    if (player instanceof org.bukkit.entity.Player) {
        setTimeout(function() {
            fakeTag.update(player);
        }, 1);
    }
};

function disable() {
    if (fakeTag) { fakeTag.disable() };
}

function FakeTag(name) {
    var ver1_13 = false;
    // NMS CLASS
    try {
        var ScoreboardBaseCriteria = bukkit.nmsCls('ScoreboardBaseCriteria');
    } catch (ex) {
        ver1_13 = true;
        var IScoreboardCriteria = bukkit.nmsCls('IScoreboardCriteria');
        var ScoreboardServer = bukkit.nmsCls("ScoreboardServer");
        var ChatComponentText = bukkit.nmsCls('ChatComponentText');
    }
    var PacketPlayOutScoreboardScore = bukkit.nmsCls('PacketPlayOutScoreboardScore');
    var PacketPlayOutScoreboardObjective = bukkit.nmsCls('PacketPlayOutScoreboardObjective');
    var PacketPlayOutScoreboardDisplayObjective = bukkit.nmsCls('PacketPlayOutScoreboardDisplayObjective');

    var scoreboardManager = bukkit.$.scoreboardManager;
    var mainScoreboard = scoreboardManager.mainScoreboard.handle;

    // 注销对象
    var objective = mainScoreboard.getObjective(name);
    if (objective) {
        mainScoreboard.unregisterObjective(objective);
    }

    try {
        if (!ver1_13) {
            // 注册tag对象
            objective = mainScoreboard.registerObjective(name, new ScoreboardBaseCriteria(name));
        } else {
            // 注册tag对象
            objective = mainScoreboard.registerObjective(name,
                IScoreboardCriteria.HEALTH,
                new ChatComponentText(name),
                IScoreboardCriteria.EnumScoreboardHealthDisplay.HEARTS);
        }
    } catch (ex) {
        throw ex
        // ignore 忽略创建错误 eg: java.lang.IllegalArgumentException: An objective with the name 'xxxxx' already exists!
    }

    if (!objective) {
        throw Error("Error Can't Found MainScoreboard Objective " + name)
    }

    // 缓存虚拟的tag包
    var cache = {
        objective: new PacketPlayOutScoreboardObjective(objective, 0),
        display: new PacketPlayOutScoreboardDisplayObjective(2, objective)
    };

    function sendPacket(player, p) {
        player.handle.playerConnection.sendPacket(p);
    }

    this.set = function(player) {
        sendPacket(player, cache.objective);
        sendPacket(player, cache.display);
        this.update(player);
    };

    function createScore(player) {
        if (!ver1_13) {
            var score = mainScoreboard.getPlayerScoreForObjective(player.name, objective);
            score.setScore(player.health);
            return new PacketPlayOutScoreboardScore(score);
        } else {
            return new PacketPlayOutScoreboardScore(ScoreboardServer.Action.CHANGE, name, player.name, player.health)
        }
    }

    this.update = function update(player) {
        var scorePack = createScore(player);
        //把其他玩家缓存的包发给这个玩家
        bukkit.players(function(t) {
            sendPacket(t, scorePack);
            if (t.name !== player.name) {
                sendPacket(player, createScore(t));
            }
        });
    };

    this.disable = function() {
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