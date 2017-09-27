'use strict';
/**
 * Bukkit 事件相关类
 */
/*global Java, base, module, exports, require, __FILE__*/
var Thread = Java.type("java.lang.Thread");
var Bukkit = Java.type("org.bukkit.Bukkit");
var Listener = Java.type("org.bukkit.event.Listener");
var Modifier = Java.type("java.lang.reflect.Modifier");
var BukkitEvent = Java.type("org.bukkit.event.Event");
var EventPriority = Java.type("org.bukkit.event.EventPriority");
var EventExecutor = Java.type("org.bukkit.plugin.EventExecutor");

var mapEvent = [];

var plugin = require('plugin').$;

/**
 * 映射事件名称 org.bukkit.event.player.PlayerLoginEvent => playerloginevent
 */
function mapEventName() {
    var eventPackageDir = "org/bukkit/event";

    var dirs = Thread.currentThread().getContextClassLoader().getResources(eventPackageDir);
    while (dirs.hasMoreElements()) {
        var url = dirs.nextElement();
        var protocol = url.protocol;
        if (protocol === "jar") {
            // noinspection JSUnresolvedVariable
            var jar = url.openConnection().jarFile;
            var entries = jar.entries();
            while (entries.hasMoreElements()) {
                var entry = entries.nextElement();
                var name = entry.name;
                if (name.startsWith(eventPackageDir) && name.endsWith(".class")) {
                    var i = name.replaceAll('/', '.');
                    try {
                        var clz = base.getClass(i.substring(0, i.length - 6));
                        if (isVaildEvent(clz)) {
                            // noinspection JSUnresolvedVariable
                            var simpleName = clz.simpleName.toLowerCase();
                            log.fd("Mapping Event [%s] => %s", clz.name, simpleName);
                            mapEvent[simpleName] = clz;
                        }
                    } catch (ex) {
                        //ignore already loaded class
                    }
                }
            }
        }
    }
}

function isVaildEvent(clz) {
    // noinspection JSUnresolvedVariable
    return BukkitEvent.class.isAssignableFrom(clz) && Modifier.isPublic(clz.getModifiers()) && !Modifier.isAbstract(clz.getModifiers());
}

/**
 * 添加事件监听
 * @param event
 * @param exec {function}
 * @param priority
 * @param ignoreCancel
 */
function listen(event, exec, priority, ignoreCancel) {
    var eventCls = mapEvent[event];
    if (!eventCls) {
        try {
            eventCls = base.getClass(eventCls);
        } catch (ex) {
            log.w("事件 %s 未找到!");
        }
        return;
    }
    if (priority === undefined) {
        priority = 'NORMAL'
    }
    if (ignoreCancel === undefined) {
        ignoreCancel = false;
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param event Event type to register
     * @param listener Listener to register
     * @param priority Priority to register this event at
     * @param executor EventExecutor to register
     * @param plugin Plugin to register
     * @param ignoreCancel
     */
    Bukkit.getPluginManager().registerEvent(
        eventCls,
        new Listener({}),
        EventPriority[priority],
        new Java.extend(EventExecutor, {
            execute: function (listener, event) {
                exec(event);
            }
        }),
        plugin,
        ignoreCancel);
    return {
        event: eventCls,
        listener: listener
    }
}

// 映射事件名称
mapEventName();

exports.on = listen;
/**
 * 取消事件监听
 * @param listener 监听结果
 */
exports.off = function (listener) {
    // noinspection JSUnresolvedVariable
    listener.event.handlerList.unregister(listener.listener);
};