'use strict';
/*global Java, base, module, exports, require, __FILE__*/
/**
 * 任务计划
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */
var plugin = require('./server').plugin.self;
var Consumer = Java.type('java.util.function.Consumer');
var Task = Java.type("org.spongepowered.api.scheduler.Task");
/**
 * 创建任务对象
 * @param func 任务
 */
exports.create = function (func) {
    return Task.builder().execute(new Consumer(function () {
        try {
            func();
        } catch (ex) {
            console.ex('§4插件执行任务时发生错误', ex);
        }
    }));
};
/**
 * 运行任务
 * @param func 任务
 */
exports.run = function (func) {
    return exports.create(func).submit(plugin);
};
/**
 * 延时运行任务
 * @param func 任务
 * @param time 延时时间
 */
exports.later = function (func, time) {
    return exports.create(func).delayTicks(time).submit(plugin);
};
/**
 * 运行循环任务
 * @constructor (任务,执行间隔).
 * @constructor (任务,首次延时,执行间隔)
 */
exports.timer = function () {
    switch (arguments.length) {
        case 2:
            return exports.create(arguments[0]).intervalTicks(arguments[1]).submit(plugin);
        case 3:
            return exports.create(arguments[0]).delayTicks(arguments[1]).intervalTicks(arguments[2]).submit(plugin);
    }
};
/**
 * 运行异步任务
 * @param  func function 任务
 */
exports.async = function (func) {
    return exports.create(func).async().submit(plugin);
};
/**
 * 延时运行异步任务
 * @param func 任务
 * @param time 延时时间
 */
exports.laterAsync = function (func, time) {
    return exports.create(func).async().delayTicks(time).submit(plugin);
};
/**
 * 运行异步循环任务
 * @constructor (任务,执行间隔).
 * @constructor (任务,首次延时,执行间隔)
 */
exports.timerAsync = function () {
    switch (arguments.length) {
        case 2:
            return exports.create(arguments[0]).async().intervalTicks(arguments[1]).submit(plugin);
        case 3:
            return exports.create(arguments[0]).async().delayTicks(arguments[1]).intervalTicks(arguments[2]).submit(plugin);
    }
};