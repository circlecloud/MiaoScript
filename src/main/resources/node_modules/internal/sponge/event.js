'use strict';
/**
 * Sponge 事件相关类
 */
/*global Java, base, module, exports, require, __FILE__*/
var Modifier = Java.type("java.lang.reflect.Modifier");
var Order = Java.type("org.spongepowered.api.event.Order");
var Event = Java.type("org.spongepowered.api.event.Event");
var EventListener = Java.type("org.spongepowered.api.event.EventListener");

var priorityMap = {
    'LOWEST': 'PRE',
    'LOW': 'FIRST',
    'NORMAL': 'DEFAULT',
    'HIGH': 'LATE',
    'HIGHEST': 'LAST',
    'MONITOR': 'POST'
};

/**
 * 判断是否为一个有效的事件类
 * @param clz
 * @returns {*|boolean}
 */
function isValidEvent(clz) {
    // noinspection JSUnresolvedVariable 继承于 org.spongepowered.api.event.Event
    return Event.class.isAssignableFrom(clz) &&
        // 访问符为Public
        Modifier.isPublic(clz.getModifiers()) &&
        // Sponge的事件都是接口
        Modifier.isAbstract(clz.getModifiers());
}

function class2Name(clazz) {
    return clazz.canonicalName.substring(clazz.name.lastIndexOf(".") + 1);
}

function register(eventCls, exec, priority, ignoreCancel) {
    var listener = new EventListener({
        handle: exec
    });
    MServer.getEventManager().registerListener(this.plugin, eventCls, Order[priorityMap[priority]], listener);
    return listener;
}

function unregister(event, listener) {
    MServer.getEventManager().unregisterListeners(listener);
}

// noinspection JSUnusedGlobalSymbols
exports = module.exports = {
    baseEventDir: 'org/spongepowered/api/event',
    isValidEvent: isValidEvent,
    class2Name: class2Name,
    register: register,
    unregister: unregister
};