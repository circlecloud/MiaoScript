package pw.yumc.MiaoScript.middleware;

import org.bukkit.entity.Player;
import org.bukkit.event.Event;
import org.bukkit.event.player.PlayerEvent;
import org.bukkit.metadata.MetadataValue;
import org.bukkit.plugin.Plugin;

import pw.yumc.YumCore.bukkit.P;

/**
 * 事件处理中间件
 *
 * @author 喵♂呜
 * @since 2016年8月25日 上午12:45:39
 */
public class EventMiddleware {
    public static String key = "EventMiddleware";

    /**
     * 生成代理玩家
     *
     * @param event
     *            事件
     * @return 处理后的Player
     */
    public Player generate(final PlayerEvent event) {
        final Player player = event.getPlayer();
        player.setMetadata(key, new EventMetaData(event));
        return player;
    }

    /**
     * 获得玩家数据
     *
     * @param player
     *            代理玩家
     * @return 事件数据
     */
    public Event get(final Player player) {
        for (final MetadataValue mv : player.getMetadata(key)) {
            if (mv.getOwningPlugin().getName().equals(P.getName())) {
                player.removeMetadata(key, P.instance);
                return (Event) mv.value();
            }
        }
        return null;
    }

    /**
     * 事件源信息
     *
     * @author 喵♂呜
     * @since 2016年8月25日 上午12:47:53
     */
    public class EventMetaData implements MetadataValue {
        Event event;

        public EventMetaData(final Event event) {
            this.event = event;
        }

        @Override
        public boolean asBoolean() {
            return false;
        }

        @Override
        public byte asByte() {
            return 0;
        }

        @Override
        public double asDouble() {
            return 0;
        }

        @Override
        public float asFloat() {
            return 0;
        }

        @Override
        public int asInt() {
            return 0;
        }

        @Override
        public long asLong() {
            return 0;
        }

        @Override
        public short asShort() {
            return 0;
        }

        @Override
        public String asString() {
            return event.getEventName();
        }

        @Override
        public Plugin getOwningPlugin() {
            return P.instance;
        }

        @Override
        public void invalidate() {
        }

        @Override
        public Object value() {
            return event;
        }
    }
}
