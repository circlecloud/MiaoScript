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

var PANE = 'STAINED_GLASS_PANE'

var description = {
    name: 'Lottery',
    version: '1.0',
    author: 'MiaoWoo',
    commands: {
        'lottery': {
            description: 'Lottery主命令'
        }
    },
    config: {
        title: '§m§s§a幸运抽奖',
        control: {
            panel: PANE + ':13',
            ok: PANE + ':14',
            no: PANE + ':15',
        },
        list: [
            {
                box: {
                    id: PANE,
                    damage: 1,
                    name: '§a箱子',
                    lore: [
                        '这是箱子的Lore'
                    ]
                },
                key: {
                    id: PANE,
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
                            id: PANE,
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
                            id: PANE,
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

var panel;
var config;
var items;

function load() {
    config = this.config;
    panel = newItemFromString(config.control.panel || PANE + ':13')
    items = new ItemStackArray(54);
    item.setName(panel, '');
    var ok = newItemFromString(config.control.ok || PANE + ':14')
    item.setName(ok, '§a确定抽奖');
    var no = newItemFromString(config.control.no || PANE + ':15')
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

function newItemFromString(str) {
    var arr = str.split(':');
    if (arr.length === 2) {
        return newItem(arr[0], arr[1]);
    } else {
        return newItem(arr[0]);
    }
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
        cmd: function(sender, command, args) {
            sender.inventory.addItem(newItemFromConfig(config.list[0].box))
            sender.inventory.addItem(newItemFromConfig(config.list[0].key))
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
        if (inv && inv.title !== config.title) return;
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
                if (!box) {
                    console.sender(player, '§c请先放入抽奖物品和钥匙!');
                    return;
                }
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
                litem.result.forEach(function(t) {
                    for (var i = 0; i < t.percent; i++) {
                        resultList.push(t);
                    }
                });
                var ri = random(resultList.length);
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

function random(max, min) {
    min = min === undefined ? 0 : min;
    return Math.floor(Math.random() * (max - min) + min);
};

function disable() {
}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};