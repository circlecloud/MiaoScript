'use strict';
/**
 * Sponge 事件相关类
 */
/*global Java, base, module, exports, require, __FILE__*/
var ref = require('reflect');
var Event = Java.type("org.bukkit.event.Event");
var Modifier = Java.type("java.lang.reflect.Modifier");
var Listener = Java.type("org.bukkit.event.Listener");
var EventPriority = Java.type("org.bukkit.event.EventPriority");
var EventExecutor = Java.type("org.bukkit.plugin.EventExecutor");

/**
 * 判断是否为一个有效的事件类
 * @param clz
 * @returns {*|boolean}
 */
function isValidEvent(clz) {
    // noinspection JSUnresolvedVariable 继承于 org.bukkit.event.Event
    return Event.class.isAssignableFrom(clz) &&
        // 访问符为Public
        Modifier.isPublic(clz.getModifiers()) &&
        // 不是抽象类
        !Modifier.isAbstract(clz.getModifiers());
}

function register(eventCls, exec, priority, ignoreCancel) {
    var listener = new Listener({});
    MServer.getPluginManager().registerEvent(
        eventCls,
        listener,
        EventPriority[priority],
        new EventExecutor({
            execute: exec
        }),
        this.plugin,
        ignoreCancel);
    return listener;
}

function unregister(event, listener) {
    ref.on(event).call('getHandlerList').get().unregister(listener);
}

exports = module.exports = {
    baseEventDir: 'org/bukkit/event',
    isValidEvent: isValidEvent,
    register: register,
    unregister: unregister
};