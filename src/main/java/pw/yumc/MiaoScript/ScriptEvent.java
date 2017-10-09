package pw.yumc.MiaoScript;

import org.bukkit.event.Cancellable;
import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;

import jdk.nashorn.api.scripting.ScriptObjectMirror;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/9/30 21:32.
 */
public class ScriptEvent extends Event implements Cancellable {
    private ScriptObjectMirror mirror;
    private boolean cancelled = false;

    public ScriptEvent(ScriptObjectMirror mirror) {
        this.mirror = mirror;
    }

    public ScriptObjectMirror getMirror() {
        return mirror;
    }

    public void setMirror(ScriptObjectMirror mirror) {
        this.mirror = mirror;
    }

    @Override
    public boolean isCancelled() {
        return cancelled;
    }

    @Override
    public void setCancelled(boolean cancel) {
        this.cancelled = cancel;
    }

    private static HandlerList handlerList = new HandlerList();

    public static HandlerList getHandlerList() {
        return handlerList;
    }

    @Override
    public HandlerList getHandlers() {
        return handlerList;
    }
}
