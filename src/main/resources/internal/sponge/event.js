'use strict';
/**
 * Bukkit 事件相关类
 */
/*global Java, base, module, exports, require, __FILE__*/
var Sponge = MServer;
var Thread = Java.type("java.lang.Thread");
var EventListener = Java.type("org.spongepowered.api.event.EventListener");
var Modifier = Java.type("java.lang.reflect.Modifier");
var Event = Java.type("org.spongepowered.api.event.Event");
var Order = Java.type("org.spongepowered.api.event.Order");

var plugin = require('./server').plugin.self;

var ref = require('reflect');

var listenerMap = [];

/**
 * 扫描包 org.spongepowered.api.event 下的所有事件
 * 映射简写名称 org.spongepowered.api.event.game.state.GameInitializationEvent => gameinitializationevent
 */
function mapEventName() {
    var eventPackageDir = "org/spongepowered/api/event";
    var count = 0;
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
                // 以 org/spongepowered/api/event 开头 并且以 .class 结尾
                if (name.startsWith(eventPackageDir) && name.endsWith(".class")) {
                    var i = name.replaceAll('/', '.');
                    try {
                        var clz = base.getClass(i.substring(0, i.length - 6));
                        // 继承于 org.spongepowered.api.event.Event 访问符为 Public 并且不是抽象类
                        if (isVaildEvent(clz)) {
                            // noinspection JSUnresolvedVariable
                            var clzName = clz.name;
                            var simpleName = clzName.substring(clzName.lastIndexOf(".") + 1).replace(/\$/g, '.').toLowerCase();
                            console.debug("Mapping Event [%s] => %s".format(clz.name, simpleName));
                            mapEvent[simpleName] = clz;
                            count++;
                        }
                    } catch (ex) {
                        //ignore already loaded class
                    }
                }
            }
        }
    }
    return count;
}

/**
 * 判断是否为一个有效的事件类
 * @param clz
 * @returns {*|boolean}
 */
function isVaildEvent(clz) {
    // noinspection JSUnresolvedVariable 继承于 org.spongepowered.api.event.Event
    return Event.class.isAssignableFrom(clz) &&
        // 访问符为Public
        Modifier.isPublic(clz.getModifiers()) &&
        // Sponge的事件都是接口
        Modifier.isAbstract(clz.getModifiers());
}

/**
 * 添加事件监听
 * @param jsp
 * @param event
 * @param exec {function}
 * @param priority [PRE,AFTER_PRE,FIRST,EARLY,DEFAULT,LATE,LAST,BEFORE_POST,POST]
 * @param ignoreCancel
 */
function listen(jsp, event, exec, priority, ignoreCancel) {
    var name = jsp.description.name;
    if (ext.isNull(name)) throw new TypeError('插件名称为空 请检查传入参数!');
    var eventCls = name2Class(event);
    if (typeof priority === 'boolean') {
        ignoreCancel = priority
        priority = 'DEFAULT'
    }
    priority = priority || 'DEFAULT';
    ignoreCancel = ignoreCancel || false;
    var listener = new EventListener({
        handle: function handle(event) {
            try {
                exec(event);
            } catch (ex) {
                console.console('§6插件 §b%s §6处理 §d%s §6事件时发生异常 §4%s'.format(name, event.class.simpleName, ex));
                console.ex(ex);
            }
        }
    });
    Sponge.getEventManager().registerListener(plugin, eventCls, Order[priority], listener)
    // 添加到缓存 用于关闭插件的时候关闭事件
    if (!listenerMap[name]) listenerMap[name] = [];
    var listeners = listenerMap[name];
    var off = {
        event: eventCls,
        listener: listener,
        off: function () {
            Sponge.getEventManager().unregisterListeners(this.listener);
            console.debug('插件 %s 注销事件 %s'.format(name, this.event.simpleName));
        }
    };
    listeners.push(off);
    // noinspection JSUnresolvedVariable
    console.debug('插件 %s 注册事件 %s => %s'.format(name, eventCls.name.substring(eventCls.name.lastIndexOf(".") + 1), exec.name === '' ? '匿名方法' : exec.name));
    return off;
}

function name2Class(event) {
    var eventCls = mapEvent[event] || mapEvent[event.toLowerCase()] || mapEvent[event + 'Event'] || mapEvent[event.toLowerCase() + 'event'];
    if (!eventCls) {
        try {
            eventCls = base.getClass(eventCls);
            mapEvent[event] = eventCls;
        } catch (ex) {
            console.console("§6插件 §b%s §6注册事件 §c%s §6失败 §4事件未找到!".format(name, event));
            console.ex(new Error("插件 %s 注册事件 %s 失败 事件未找到!".format(name, event)))
            return;
        }
    }
    return eventCls;
}

var mapEvent = [];
// 映射事件名称
console.info('Sponge 事件映射完毕 共计 %s 个事件!'.format(mapEventName().toFixed(0)));

module.exports = {
    on: listen,
    disable: function (jsp) {
        var jspl = listenerMap[jsp.description.name];
        if (jspl) {
            jspl.forEach(function (t) t.off());
            delete listenerMap[jsp.description.name];
        }
    }
};