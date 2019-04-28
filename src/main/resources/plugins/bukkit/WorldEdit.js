'use strict';
/**
 * WorldEdit 插件
 */
/*global Java, base, module, exports, require*/
var command = require('api/command');
var Material = Java.type("org.bukkit.Material");

var description = {
    name: 'WorldEdit',
    version: '1.0',
    author: 'MiaoWoo',
    commands: {
        '/up': {
            description: 'Up Player And Set Block'
        }
    }
};

function load() {
}

function enable() {
    command.on(this, '/up', {
        cmd: function(sender, command, args) {
            if (!sender.openInventory) {
                return;
            }
            var player = sender;
            var location = player.location;
            var type = Material[args[0]] || Material['STONE'];
            player.velocity = player.velocity.setY(0.5);
            setTimeout(function() {
                location.block.type = type
            }, 8);
            return true;
        },
        tab: function(sender, command, args) {

        }
    });
}

module.exports = {
    description: description,
    enable: enable
};
