package pw.yumc.MiaoScript.api.bukkit;

import lombok.Getter;
import org.bukkit.event.Cancellable;
import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;

import javax.script.Bindings;

@Getter
public class ScriptEvent extends Event implements Cancellable {
    private final Bindings plugin;
    private final String event;
    private final Bindings data;

    private boolean cancelled = false;

    public ScriptEvent(Bindings plugin, String event, Bindings data) {
        this.plugin = plugin;
        this.event = event;
        this.data = data;
    }

    @Override
    public boolean isCancelled() {
        return this.cancelled;
    }

    @Override
    public void setCancelled(boolean b) {
        this.cancelled = b;
    }

    @Getter
    private static final HandlerList handlerList = new HandlerList();

    @Override
    public HandlerList getHandlers() {
        return handlerList;
    }
}
