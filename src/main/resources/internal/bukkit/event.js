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
function isVaildEvent(clz) {
    // noinspection JSUnresolvedVariable 继承于 org.bukkit.event.Event
    return Event.class.isAssignableFrom(clz) &&
        // 访问符为Public
        Modifier.isPublic(clz.getModifiers()) &&
        // 不是抽象类
        !Modifier.isAbstract(clz.getModifiers());
}

function register(eventCls, priority, ignoreCancel) {
    var listener = new Listener({});
    MServer.getPluginManager().registerEvent(
        eventCls,
        listener,
        EventPriority[priority],
        new EventExecutor({
            execute: function execute(listener, event) {
                try {
                    exec(event);
                } catch (ex) {
                    console.console('§6插件 §b%s §6处理 §d%s §6事件时发生异常 §4%s'.format(name, event.class.simpleName, ex));
                    console.ex(ex);
                }
            }
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
    isVaildEvent: isVaildEvent,
    register: register,
    unregister: unregister
};