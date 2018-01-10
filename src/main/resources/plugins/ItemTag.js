'use strict';
/*global Java, base, module, exports, require*/

var server = require('api/server');
var event = require('api/event');
var task = require('api/task');
var http = require('http');
var fs = require('fs');

var description = {
    name: 'ItemTag',
    version: '1.0',
    author: '喵♂呜'
};

var itemConfig;

function load() {
    var itemFile = self.file('item.yml');
    task.async(function () {
        if (!itemFile.exists()) {
            fs.save(itemFile, http.get('https://data.yumc.pw/config/Item_zh_CN.yml'))
        }
        itemConfig = self.getConfig('item.yml')
    })
}

function enable() {
    switch (DetectServerType) {
        case ServerType.Bukkit:
            event.on(self, 'ItemMergeEvent', function (event) {
                bukkit(event.target, event.entity.itemStack.amount + event.target.itemStack.amount);
            })
            event.on(self, 'ItemSpawnEvent', function (event) {
                if (event.entity.itemStack) {
                    bukkit(event.entity, event.entity.itemStack.amount);
                }
            })
            break;
        case ServerType.Sponge:
            event.on(self, 'itemmergeitemevent', function (event) {
                // Sponge 暂未实现当前事件
            })
            event.on(self, 'spawnentityevent', function (event) {
                event.entities.forEach(function (entity) {
                    if (entity.type.name === "item") sponge(entity);
                })
            })
            break;
    }
}

function getItemName(name) {
    return itemConfig[(name + '').toUpperCase()] || name;
}

function bukkit(item , amount) {
    var amounts = amount == 1 ? "" : "*" + amount;
    item.setCustomName('§b' + getItemName(item.itemStack.type) + amounts);
    item.setCustomNameVisible(true);
}

function sponge(entity) {
    var itemOptional = entity.get(org.spongepowered.api.data.key.Keys.REPRESENTED_ITEM);
    if (itemOptional.isPresent()) {
        var item = itemOptional.get();
        var amounts = item.count == 1 ? "" : "*" + item.count;
        entity.offer(org.spongepowered.api.data.key.Keys.DISPLAY_NAME, org.spongepowered.api.text.Text.of('§b' + getItemName(item.type.name.split(':')[1]) + amounts));
        entity.offer(org.spongepowered.api.data.key.Keys.CUSTOM_NAME_VISIBLE, true);
    }
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};
