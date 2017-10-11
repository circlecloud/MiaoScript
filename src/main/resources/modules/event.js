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
var HandlerList = Java.type('org.bukkit.event.HandlerList');
var EventPriority = Java.type("org.bukkit.event.EventPriority");
var EventExecutor = Java.type("org.bukkit.plugin.EventExecutor");
var IllegalStateException = Java.type("java.lang.IllegalStateException");

var plugin = base.plugin;

var ref = require('kit/reflect');

var jspListener = [];

/**
 * 扫描包 org.bukkit.event 下的所有事件
 * 映射简写名称 org.bukkit.event.player.PlayerLoginEvent => playerloginevent
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
                // 以 org/bukkit/event 开头 并且以 .class 结尾
                if (name.startsWith(eventPackageDir) && name.endsWith(".class")) {
                    var i = name.replaceAll('/', '.');
                    try {
                        var clz = base.getClass(i.substring(0, i.length - 6));
                        // 继承于 org.bukkit.event.Event 访问符为Public
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

/**
 * 判断是否为一个有效的事件类
 * @param clz
 * @returns {*|boolean}
 */
function isVaildEvent(clz) {
    // noinspection JSUnresolvedVariable 继承于 org.bukkit.event.Event
    return BukkitEvent.class.isAssignableFrom(clz) &&
        // 访问符为Public
        Modifier.isPublic(clz.getModifiers()) &&
        // 不是抽象类
        !Modifier.isAbstract(clz.getModifiers());
}

/**
 * 添加事件监听
 * @param jsp
 * @param event
 * @param exec {function}
 * @param priority
 * @param ignoreCancel
 */
function listen(jsp, event, exec, priority, ignoreCancel) {
    var pname = jsp.description.name;
    if (ext.isNull(pname)) {
        throw new TypeError('插件名称为空 请检查传入参数!');
    }
    var eventCls = mapEvent[event];
    if (!eventCls) {
        try {
            eventCls = base.getClass(eventCls);
        } catch (ex) {
            log.w("事件 %s 未找到!", event);
            return;
        }
    }
    if (priority === undefined) {
        priority = 'NORMAL'
    }
    if (ignoreCancel === undefined) {
        ignoreCancel = false;
    }
    if (!jspListener[jsp.description.name]) {
        jspListener[jsp.description.name] = [];
    }
    var listener = new Listener({});
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
        listener,
        EventPriority[priority],
        new EventExecutor({
            execute: function (listener, event) {
                exec(event);
            }
        }),
        plugin,
        ignoreCancel);
    // 添加到缓存 用于关闭插件的时候关闭事件
    var listeners = jspListener[jsp.description.name];
    listeners.push(listener);
    // noinspection JSUnresolvedVariable
    log.d('注册事件 %s 方法 %s', eventCls.simpleName, exec.name === '' ? '匿名方法' : exec.name);
    return {
        event: eventCls,
        listener: listener
    }
}

/**
 * 取消事件监听
 * @param listener 监听结果
 */
function unlisten(listener) {
    if (!listener.event || !listener.listener) {
        throw new IllegalStateException("非法的监听器对象 无法取消事件!");
    }
    ref.on(listener.event).call('getHandlerList').get().unregister(listener.listener);
    // noinspection JSUnresolvedVariable
    log.d('注销事件 %s', listener.event.simpleName);
}

var mapEvent = [];
// 映射事件名称
mapEventName();
// log.i('Bukkit 事件映射完毕 共计 %s 个事件!', mapEvent.length);

module.exports = {
    on: listen,
    off: unlisten,
    disable: function (jsp) {
        jspListener[jsp.description.name].forEach(function (t) {
            ref.on(HandlerList).call('unregisterAll', t);
        })
    }
};