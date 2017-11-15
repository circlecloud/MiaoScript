'use strict';
/**
 * 物品快速生成类
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */
/*global Java, base, module, exports, require, __FILE__*/
var Bukkit = MServer;
var item = {};
var ItemStack = Java.type("org.bukkit.inventory.ItemStack");
var Material = Java.type('org.bukkit.Material');

/**
 * 创建一个物品
 * @constructor (ID)
 * @constructor (ID,数量)
 * @constructor (ID,数量,子ID)
 */
item.create = function () {
    var idOrType = arguments[0];
    if (isNaN(Number(idOrType))) {
        idOrType = Material[idOrType];
    }
    switch (arguments.length) {
        case 1:
            return new ItemStack(idOrType);
        case 2:
            return new ItemStack(idOrType, arguments[1]);
        case 3:
            return new ItemStack(idOrType, arguments[1], arguments[2]);
    }
};
/**
 * 创建一个头颅
 * @constructor (玩家名称)
 */
item.head = function (name) {
    var head = item.create(397, 1, 3);
    var skullMeta = head.getItemMeta();
    skullMeta.setOwner(name);
    head.setItemMeta(skullMeta);
    return head;
};
/**
 * 给玩家添加物品
 * @param player 玩家
 * @param items 物品数组
 * @param drop 满背包是否掉落
 */
item.add = function (player, items, drop) {
    var drops = player.getInventory().addItem(items).values();
    if (drops.size() !== 0 && drop) {
        drops.forEach(function (itemStack) {
            item.drop(player.getLocation(), itemStack);
        });
    }
};
/**
 * 指定地点掉落物品
 * @param loc 地点
 * @param item 物品
 */
item.drop = function (loc, item) {
    setTimeout(function () {
        loc.getWorld().dropItem(loc, item);
    }, 1);
};
/**
 * 设置物品名称
 * @param item 物品
 * @param name
 * @returns {*}
 */
item.setName = function (item, name) {
    if (item.getType().name() !== "AIR") {
        var meta = item.hasItemMeta() ? item.getItemMeta() : Bukkit.getItemFactory().getItemMeta(item.getType());
        meta.setDisplayName(name);
        item.setItemMeta(meta);
    }
    return item;
};
/**
 * 设置物品Lore
 * @param item 物品
 * @param lores Lore
 * @returns {*} 物品
 */
item.setLore = item.setLores = function (item, lores) {
    if (item.getType().name() !== "AIR") {
        var meta = item.hasItemMeta() ? item.getItemMeta() : Bukkit.getItemFactory().getItemMeta(item.getType());
        if (typeof(lores) === 'string') {
            lores = lores.split("\n")
        }
        meta.setLore(lores);
        item.setItemMeta(meta);
    }
    return item;
};

module.exports = item;