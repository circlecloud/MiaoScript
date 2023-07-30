package pw.yumc.MiaoScript;

import com.google.inject.Inject;
import lombok.SneakyThrows;
import org.slf4j.Logger;
import org.spongepowered.api.config.ConfigDir;
import org.spongepowered.api.event.Listener;
import org.spongepowered.api.event.game.GameReloadEvent;
import org.spongepowered.api.event.game.state.GamePreInitializationEvent;
import org.spongepowered.api.event.game.state.GameStartedServerEvent;
import org.spongepowered.api.event.game.state.GameStoppingServerEvent;
import org.spongepowered.api.plugin.Plugin;
import pw.yumc.MiaoScript.api.MiaoScriptAPI;
import pw.yumc.MiaoScript.api.ScriptEngine;

import java.io.File;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/10/25 20:35.
 */
@Plugin(id = "miaoscript", name = "MiaoScript", description = "MiaoScript runtime in Sponge", version = MiaoScriptAPI.VERSION, authors = "MiaoWoo")
public class MiaoScriptSponge {
    private ScriptEngine engine;
    @Inject
    private Logger logger;

    @Inject
    @ConfigDir(sharedRoot = false)
    private File pluginConfigDir;

    @Listener
    @SneakyThrows
    public void onPreInitialization(GamePreInitializationEvent event) {
        engine = MiaoScriptAPI.createEngine(pluginConfigDir.getCanonicalPath(), logger, this);
        engine.loadEngine();
    }

    @Listener
    @SneakyThrows
    public void onStarted(GameStartedServerEvent event) {
        engine.enableEngine();
    }

    @Listener
    @SneakyThrows
    public void onStop(GameStoppingServerEvent event) {
        engine.disableEngine();
        engine = null;
    }

    @Listener
    @SneakyThrows
    public void reload(GameReloadEvent event) {
        engine.disableEngine();
        System.gc();
        engine.loadEngine();
        engine.enableEngine();
    }
}
