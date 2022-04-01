package pw.yumc.MiaoScript.api.bukkit;

import org.bukkit.event.Cancellable;
import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;

import javax.script.Bindings;

public class ScriptEvent extends Event implements Cancellable {
    private final String plugin;
    private final String event;
    private final Bindings data;
    private boolean cancelled = false;

    public ScriptEvent(String plugin, String event, Bindings data) {
        this.plugin = plugin;
        this.event = event;
        this.data = data;
    }

    /**
     * Which Plugin Call Event
     *
     * @return PluginName
     */
    public String getPlugin() {
        return plugin;
    }

    /**
     * Plugin Event Name
     *
     * @return EventName
     */
    public String getEvent() {
        return event;
    }

    /**
     * Plugin Event Data
     *
     * @return EventData
     */
    public Bindings getData() {
        return data;
    }

    @Override
    public boolean isCancelled() {
        return this.cancelled;
    }

    @Override
    public void setCancelled(boolean b) {
        this.cancelled = b;
    }

    private static final HandlerList handlerList = new HandlerList();

    public static HandlerList getHandlerList() {
        return handlerList;
    }

    @Override
    public HandlerList getHandlers() {
        return handlerList;
    }
}
