'use strict';
/**
 * Hello Wrold 测试插件
 */
/*global Java, base, module, exports, require*/

var event = require('api/event');
var command = require('api/command');
var bukkit = require('api/server');
var item = require('api/item');

var Arrays = Java.type('java.util.Arrays');
var ItemStackArray = Java.type('org.bukkit.inventory.ItemStack[]');

var description = {
    name: 'Lottery',
    version: '1.0',
    commands: {
        'lottery': {
            description: 'Lottery主命令'
        }
    },
    config: {
        title: '§m§s§a幸运抽奖',
        panel: '160:13',
        list: [
            {
                box: {
                    id: 160,
                    damage: 1,
                    name: '§a箱子',
                    lore: [
                        '这是箱子的Lore'
                    ]
                },
                key: {
                    id: 160,
                    damage: 2,
                    name: '§b钥匙',
                    lore: [
                        '这是钥匙的Lore'
                    ]
                },
                result: [
                    {
                        percent: 10,
                        command: 'money give %player% 100',
                        item: {
                            id: 160,
                            damage: 3,
                            name: '§c奖品1',
                            lore: [
                                '这是奖品1的Lore'
                            ]
                        }
                    },
                    {
                        percent: 20,
                        command: 'money give %player% 200',
                        item: {
                            id: 160,
                            damage: 4,
                            name: '§c奖品2',
                            lore: [
                                '这是奖品2的Lore'
                            ]
                        }
                    }
                ]
            }
        ]
    }
};

var panel = item.create(160, 1, 13);
var config;
var items;

function load() {
    config = this.config;
    if (config.panel) {
        var arr = config.panel.split(':');
        if (arr.length === 2) {
            panel = newItem(arr[0], arr[1]);
        } else {
            panel = newItem(arr[0]);
        }
    }
    items = new ItemStackArray(54);
    item.setName(panel, '');
    var ok = newItem(160, 14);
    item.setName(ok, '§a确定抽奖');
    var no = newItem(160, 15);
    item.setName(no, '§c取消抽奖');
    Arrays.fill(items, 0, 10, panel);
    Arrays.fill(items, 11, 16, panel);
    Arrays.fill(items, 17, 29, panel);
    items[29] = no;
    Arrays.fill(items, 30, 33, panel);
    items[33] = ok;
    Arrays.fill(items, 34, 40, panel);
    Arrays.fill(items, 41, 54, panel);
}

function isTargetItem(item, config) {
    return item.typeId === config.id &&
        item.itemMeta &&
        item.itemMeta.displayName === config.name &&
        item.itemMeta.lore && Java.from(item.itemMeta.lore).toJson() === config.lore.toJson()
}

function newItem(name, sub) {
    return item.create(name, 1, sub || 0);
}

function newItemFromConfig(config) {
    var i = newItem(config.id, config.damage);
    if (config.name) item.setName(i, config.name);
    if (config.lore) item.setLore(i, config.lore);
    return i;
}

function enable() {
    // noinspection JSUnusedLocalSymbols
    command.on(this, 'l', {
        cmd: function (sender, command, args) {
            if (!sender.openInventory) {
                console.sender(sender, "§4当前用户无法使用该命令!");
            }
            var inv = MServer.createInventory(null, 54, config.title);
            inv.setContents(items);
            sender.openInventory(inv);
            return true;
        }
    });
    event.on(this, 'InventoryClick', function click(event) {
        var inv = event.inventory;
        if (inv.title !== config.title) return;
        var player = event.whoClicked;
        var slot = event.rawSlot;
        if (slot > 53 || slot < 0) {
            return;
        }
        event.cancelled = true;
        switch (slot) {
            case 10:
            case 16:
            case 40:
                event.cancelled = false;
                break;
            case 29:
                // TODO 关闭界面
                player.closeInventory();
                break;
            case 33:
                var temp = inv.getItem(40);
                if (temp && temp.typeId !== 0) {
                    console.sender(player, '§c请先取走奖品!');
                    return;
                }
                var litem;
                var box = inv.getItem(10);
                var key = inv.getItem(16);
                if (box && box.typeId !== 0 && key && key.typeId !== 0) {
                    for (var i = 0; i < config.list.length; i++) {
                        var r = config.list[i];
                        if (isTargetItem(box, r.box)) {
                            litem = r;
                            break;
                        }
                    }
                }
                // TODO 抽奖
                if (!litem) {
                    console.sender(player, '§c请先放入抽奖物品和钥匙!');
                    return;
                }
                if (!isTargetItem(key, litem.key)) {
                    console.sender(player, '§c抽奖物品和钥匙不匹配!');
                    return;
                }
                var resultList = [];
                litem.result.forEach(function (t) {
                    for (var i = 0; i < t.percent; i++) {
                        resultList.push(t);
                    }
                });
                var ri = ext.random(resultList.length);
                var result = resultList[ri];
                box.amount = box.amount - 1;
                key.amount = key.amount - 1;
                inv.setItem(10, box);
                inv.setItem(16, key);
                inv.setItem(40, newItemFromConfig(result.item));
                bukkit.console(result.command.replace('%player%', player.name));
                break;
            default:
                event.cancelled = true;
        }
    });
}

function disable() {
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};