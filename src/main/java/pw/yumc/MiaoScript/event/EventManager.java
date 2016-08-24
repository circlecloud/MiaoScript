package pw.yumc.MiaoScript.event;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.bukkit.Bukkit;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.event.Event;
import org.bukkit.event.EventException;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerEvent;
import org.bukkit.plugin.EventExecutor;

import me.clip.placeholderapi.PlaceholderAPI;
import pw.yumc.MiaoScript.MiaoScript;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;

/**
 * 脚本管理
 *
 * @author 喵♂呜
 * @since 2016年8月24日 下午12:51:48
 */
public class EventManager implements Listener {
    public static boolean debug = false;
    private static String identifier = "%s_%s";
    private final MiaoScript plugin = P.getPlugin();
    /**
     * 未处理的数据
     */
    private final List<EventInfo> eventInfos = new ArrayList<>();
    /**
     * 处理后的数据
     */
    private final Map<String, EventInfo> events = new HashMap<>();

    public EventManager(final ConfigurationSection config) {
        for (final String event : config.getKeys(false)) {
            final ConfigurationSection e = config.getConfigurationSection(event);
            if (e == null) {
                continue;
            }
            eventInfos.add(new EventInfo(event, e));
        }
    }

    public void debug(final String msg) {
        if (debug) {
            Log.info(msg);
        }
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
        debug(String.format("名称: %s 事件: %s 优先级: %s", ei.getName(), ei.getClazz().substring(ei.getClazz().lastIndexOf(".") + 1), ei.getPriority()));
        debug("脚本列表: ");
    }

    /**
     * 注册事件
     *
     * @param eventInfo
     *            事件信息
     */
    @SuppressWarnings("unchecked")
    public boolean register(final EventInfo eventInfo) {
        try {
            final Class<? extends Event> clazz = (Class<? extends Event>) Class.forName(eventInfo.getClazz());
            final EventPriority priority = EventPriority.valueOf(eventInfo.getPriority());
            events.put(getIdentifier(clazz, priority), eventInfo);
            Bukkit.getPluginManager().registerEvent(clazz, this, priority, new EventExecutor() {
                @Override
                public void execute(final Listener listener, final Event event) throws EventException {
                    final EventInfo ei = plugin.getEventManager().getEvent(event, priority);
                    if (ei == null) {
                        Log.debug(String.format("事件 %s_%s 未找到对应处理脚本!", event.getEventName(), priority.name()));
                        return;
                    }
                    debug("========== MiaoScript Debug ==========");
                    printInfo(ei);
                    if (event instanceof PlayerEvent) {
                        final PlayerEvent pe = (PlayerEvent) event;
                        for (final String script : ei.getScripts()) {
                            final String result = PlaceholderAPI.setPlaceholders(plugin.getEventMiddleware().generate(pe), script);
                            debug(String.format("- %s 返回值: %s", script, result));
                        }

                    } else {
                        Log.debug(String.format("事件 %s 未继承 PlayerEvent 可能无法正常调用!", event.getEventName()));
                    }
                    debug("========== MiaoScript Debug ==========");
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
        int count = 0;
        for (final EventInfo ei : eventInfos) {
            if (!ei.getScripts().isEmpty() && register(ei)) {
                count++;
            }
        }
        Log.info(String.format("已注册 %s 个事件...", count));
    }
}
