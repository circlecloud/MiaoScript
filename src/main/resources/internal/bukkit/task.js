'use strict';
/*global Java, base, module, exports, require, __FILE__*/
/**
 * 任务计划
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */
var plugin = require('./server').plugin.self;
var BukkitRunnable = Java.type("org.bukkit.scheduler.BukkitRunnable");
/**
 * 创建任务对象
 * @param func 任务
 */
function create(func) {
    if (toString.call(func) !== "[object Function]") { throw TypeError('第一个参数 Task 必须为 function !'); };
    return new BukkitRunnable(func);
};
/**
 * 运行任务
 * @param func 任务
 */
function run(func) {
    return exports.create(func).runTask(plugin);
};
/**
 * 延时运行任务
 * @param func 任务
 * @param time 延时时间
 */
function later(func, time) {
    return exports.create(func).runTaskLater(plugin, time);
};
/**
 * 运行循环任务
 * @constructor (任务,执行间隔).
 * @constructor (任务,首次延时,执行间隔)
 */
function timer() {
    switch (arguments.length) {
        case 2:
            return exports.create(arguments[0]).runTaskTimer(plugin, 0, arguments[1]);
        case 3:
            return exports.create(arguments[0]).runTaskTimer(plugin, arguments[1], arguments[2]);
        default:
            throw TypeError('参数错误 task.timer(func, [delay], interval)');
    }
};
/**
 * 运行异步任务
 * @param  func function 任务
 */
function _async(func) {
    return exports.create(func).runTaskAsynchronously(plugin);
};
/**
 * 延时运行异步任务
 * @param func 任务
 * @param time 延时时间
 */
function laterAsync(func, time) {
    return exports.create(func).runTaskLaterAsynchronously(plugin, time);
};
/**
 * 运行异步循环任务
 * @constructor (任务,执行间隔).
 * @constructor (任务,首次延时,执行间隔)
 */
function timerAsync() {
    switch (arguments.length) {
        case 2:
            return exports.create(arguments[0]).runTaskTimerAsynchronously(plugin, 0, arguments[1]);
        case 3:
            return exports.create(arguments[0]).runTaskTimerAsynchronously(plugin, arguments[1], arguments[2]);
        default:
            throw TypeError('参数错误 task.timerAsync(func, [delay], interval)');
    }
};

exports = module.exports = {
    run: run,
    later: later,
    timer: timer,
    async: _async,
    laterAsync: laterAsync,
    timerAsync: timerAsync
}