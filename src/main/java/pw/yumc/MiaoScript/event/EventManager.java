package pw.yumc.MiaoScript.event;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.script.ScriptException;

import org.bukkit.Bukkit;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.Player;
import org.bukkit.event.Event;
import org.bukkit.event.EventException;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerEvent;
import org.bukkit.plugin.EventExecutor;

import pw.yumc.MiaoScript.MiaoScript;
import pw.yumc.MiaoScript.data.ConfigManager;
import pw.yumc.MiaoScript.javascript.MiaoScriptEngine;
import pw.yumc.MiaoScript.misc.MLog;
import pw.yumc.MiaoScript.script.ScriptInfo;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;

/**
 * 事件管理
 *
 * @author 喵♂呜
 * @since 2016年8月24日 下午12:51:48
 */
public class EventManager implements Listener {
    private static final String EVENT_FUNCTION = "handle";
    private static final String PROCESS_NOT_FOUND = "事件脚本 %s 脚本未包含 hanlde(Event) 函数!";
    private static final String INVIDE_SCRIPT = "事件脚本 %s 语法错误: %s";
    private static String identifier = "%s_%s";
    private final MiaoScript plugin = P.getPlugin();
    private final ConfigurationSection config;

    /**
     * 未处理的数据
     */
    private final List<EventInfo> eventInfos = new ArrayList<>();
    /**
     * 处理后的数据
     */
    private final Map<String, EventInfo> events = new HashMap<>();

    public EventManager(final ConfigurationSection config) {
        this.config = config;
    }

    /**
     * 获得事件信息
     *
     * @param event
     *            事件
     * @param priority
     *            事件等级
     * @return 事件处理信息
     */
    public EventInfo getEvent(final Event event, final EventPriority priority) {
        return getEvent(getIdentifier(event.getClass(), priority));
    }

    /**
     * 获得事件信息
     *
     * @param name
     *            事件占位符
     * @return 事件处理信息
     */
    public EventInfo getEvent(final String name) {
        return events.get(name);
    }

    /**
     * @return 获得注册的事件
     */
    public Map<String, EventInfo> getEvents() {
        return events;
    }

    /**
     * 获得占位符
     *
     * @param event
     *            事件
     * @param priority
     *            优先级
     * @return 占位符
     */
    public String getIdentifier(final Class<? extends Event> event, final EventPriority priority) {
        return String.format(identifier, event.getSimpleName(), priority.name());
    }

    /**
     * 调试
     *
     * @param ei
     *            事件信息
     */
    public void printInfo(final EventInfo ei) {
        MLog.debug(String.format("名称: %s 事件: %s 优先级: %s", ei.getName(), ei.getClazz().substring(ei.getClazz().lastIndexOf(".") + 1), ei.getPriority()));
        MLog.debug("脚本列表: ");
    }

    /**
     * 注册事件
     *
     * @param eventInfo
     *            事件信息
     */
    public boolean register(final EventInfo eventInfo) {
        return register(eventInfo, this);
    }

    /**
     * 注册事件
     *
     * @param eventInfo
     *            事件信息
     * @param listener
     *            监听器
     * @return
     */
    @SuppressWarnings("unchecked")
    public boolean register(final EventInfo eventInfo, final Listener listener) {
        try {
            final Class<? extends Event> clazz = (Class<? extends Event>) Class.forName(eventInfo.getClazz());
            final EventPriority priority = EventPriority.valueOf(eventInfo.getPriority());
            events.put(getIdentifier(clazz, priority), eventInfo);
            Log.debug(String.format("监听器 %s 注册事件 %s 等级 %s", listener.getClass().getSimpleName(), eventInfo.getClazz(), eventInfo.getPriority()));
            Bukkit.getPluginManager().registerEvent(clazz, listener, priority, new EventExecutor() {
                @Override
                public void execute(final Listener listener, final Event event) throws EventException {
                    final EventInfo ei = plugin.getManagerCenter().getEventManager().getEvent(event, priority);
                    if (ei == null) {
                        Log.debug(String.format("事件 %s_%s 未找到对应处理脚本!", event.getEventName(), priority.name()));
                        return;
                    }
                    MLog.debug("========== MiaoScript Debug ==========");
                    printInfo(ei);
                    Player player = null;
                    final ConfigManager cfgmgr = ei.getModule() != null ? ei.getModule().getConfigManager() : plugin.getManagerCenter().getConfigManager();
                    if (event instanceof PlayerEvent) {
                        player = ((PlayerEvent) event).getPlayer();
                    }
                    final MiaoScriptEngine engine = MiaoScriptEngine.getDefault();
                    engine.put("Event", event);
                    engine.put("Player", player);
                    engine.put("Config", cfgmgr.get());
                    engine.put("PlayerConfig", cfgmgr);
                    for (final String scriptname : ei.getScripts()) {
                        final ScriptInfo script = plugin.getManagerCenter().getScriptManager().getScript(scriptname);
                        if (script == null) {
                            Log.debug(String.format("事件 %s_%s 未找到 %s 脚本!", event.getEventName(), priority.name(), scriptname));
                        }
                        Object result = null;
                        try {
                            engine.eval(script.getExpression(player));
                            result = engine.invokeFunction(EVENT_FUNCTION, new Object[] { event });
                        } catch (final NoSuchMethodException e1) {
                            Log.warning(String.format(PROCESS_NOT_FOUND, scriptname));
                        } catch (final ScriptException e1) {
                            Log.warning(String.format(INVIDE_SCRIPT, scriptname, e1.getMessage()));
                        }
                        MLog.debug(String.format("- %s 返回值: %s", scriptname, result));
                    }
                    MLog.debug("======================================");
                }
            }, plugin);
            return true;
        } catch (final ClassNotFoundException e) {
            Log.warning(String.format("事件 %s 的监听类 %s 未找到!", eventInfo.getName(), eventInfo.getClazz()));
        } catch (final Exception e) {
            Log.warning(String.format("事件 %s 的注册失败 %s: %s!", eventInfo.getName(), e.getClass().getName(), e.getMessage()));
        }
        return false;
    }

    /**
     * 注册所有事件
     */
    public void registerAll() {
        eventInfos.clear();
        for (final String event : config.getKeys(false)) {
            final ConfigurationSection e = config.getConfigurationSection(event);
            if (e == null) {
                continue;
            }
            eventInfos.add(new EventInfo(event, e));
        }
        int count = 0;
        for (final EventInfo ei : eventInfos) {
            if (!ei.getScripts().isEmpty() && register(ei)) {
                count++;
            }
        }
        Log.info(String.format("已注册全局事件 %s 个...", count));
    }
}
