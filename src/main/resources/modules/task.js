'use strict';
/*global Java, base, module, exports, require, __FILE__*/
/**
 * 任务计划
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */
var plugin = base.plugin;
var BukkitRunnable = Java.type("org.bukkit.scheduler.BukkitRunnable");
/**
 * 创建任务对象
 * @param func 任务
 */
exports.create = function (func) {
    return new BukkitRunnable(func);
};
/**
 * 运行任务
 * @param func 任务
 */
exports.run = function (func) {
    return exports.create(func).runTask(plugin);
};
/**
 * 延时运行任务
 * @param func 任务
 * @param time 延时时间
 */
exports.later = function (func, time) {
    return exports.create(func).runTaskLater(plugin, time);
};
/**
 * 运行循环任务
 * @constructor (任务,执行间隔).
 * @constructor (任务,首次延时,执行间隔)
 */
exports.timer = function () {
    switch (arguments.length) {
        case 2:
            return exports.create(arguments[0]).runTaskTimer(plugin, 0, arguments[1]);
        case 3:
            return exports.create(arguments[0]).runTaskTimer(plugin, arguments[1], arguments[2]);
    }
};
/**
 * 运行异步任务
 * @param  func function 任务
 */
exports.async = function (func) {
    return exports.create(func).runTaskAsynchronously(plugin);
};
/**
 * 延时运行异步任务
 * @param func 任务
 * @param time 延时时间
 */
exports.laterAsync = function (func, time) {
    return exports.create(func).runTaskLaterAsynchronously(plugin, time);
};
/**
 * 运行异步循环任务
 * @constructor (任务,执行间隔).
 * @constructor (任务,首次延时,执行间隔)
 */
exports.timerAsync = function () {
    switch (arguments.length) {
        case 2:
            return exports.create(arguments[0]).runTaskTimerAsynchronously(plugin, 0, arguments[1]);
        case 3:
            return exports.create(arguments[0]).runTaskTimerAsynchronously(plugin, arguments[1], arguments[2]);
    }
};