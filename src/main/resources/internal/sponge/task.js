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
function create(func) {
    if (toString.call(func) !== "[object Function]") { throw TypeError('第一个参数 Task 必须为 function !'); };
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
function run(func) {
    return create(func).submit(plugin);
};
/**
 * 延时运行任务
 * @param func 任务
 * @param time 延时时间
 */
function later(func, time) {
    return create(func).delayTicks(time).submit(plugin);
};
/**
 * 运行循环任务
 * @constructor (任务,执行间隔).
 * @constructor (任务,首次延时,执行间隔)
 */
function timer() {
    switch (arguments.length) {
        case 2:
            return create(arguments[0]).intervalTicks(arguments[1]).submit(plugin);
        case 3:
            return create(arguments[0]).delayTicks(arguments[1]).intervalTicks(arguments[2]).submit(plugin);
        default:
            throw TypeError('参数错误 task.timer(func, [delay], interval)');
    }
};
/**
 * 运行异步任务
 * @param  func function 任务
 */
function _async(func) {
    return create(func).async().submit(plugin);
};
/**
 * 延时运行异步任务
 * @param func 任务
 * @param time 延时时间
 */
function laterAsync(func, time) {
    return create(func).async().delayTicks(time).submit(plugin);
};
/**
 * 运行异步循环任务
 * @constructor (任务,执行间隔).
 * @constructor (任务,首次延时,执行间隔)
 */
function timerAsync() {
    switch (arguments.length) {
        case 2:
            return create(arguments[0]).async().intervalTicks(arguments[1]).submit(plugin);
        case 3:
            return create(arguments[0]).async().delayTicks(arguments[1]).intervalTicks(arguments[2]).submit(plugin);
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