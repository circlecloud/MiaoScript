package pw.yumc.MiaoScript;

import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/9/22 18:39.
 */
public class BaseEvent extends Event {
    private static HandlerList handlerList = new HandlerList();

    public BaseEvent() {
    }

    public static HandlerList getHandlerList() {
        return handlerList;
    }

    @Override
    public HandlerList getHandlers() {
        return handlerList;
    }
}
