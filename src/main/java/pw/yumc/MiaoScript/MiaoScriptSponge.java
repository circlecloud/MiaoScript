package pw.yumc.MiaoScript;

import java.io.File;

import org.slf4j.Logger;
import org.spongepowered.api.config.ConfigDir;
import org.spongepowered.api.event.Listener;
import org.spongepowered.api.event.game.state.GameStartedServerEvent;
import org.spongepowered.api.event.game.state.GameStoppingServerEvent;
import org.spongepowered.api.plugin.Plugin;

import com.google.inject.Inject;
import lombok.SneakyThrows;

/**
 * Created with IntelliJ IDEA
 *
 * @author 喵♂呜
 * Created on 2017/10/25 20:35.
 */
@Plugin(id = "miaoscript", name = "MiaoScript", version = "1.0", authors = "喵♂呜")
public class MiaoScriptSponge {
    private ScriptEngine engine;
    @Inject
    private Logger logger;

    @Inject
    @ConfigDir(sharedRoot = false)
    private File pluginConfigDir;

    @Listener
    @SneakyThrows
    public void onStart(GameStartedServerEvent event) {
        engine = new ScriptEngine(pluginConfigDir.getCanonicalPath(), logger);
        engine.enableEngine();
    }

    @Listener
    @SneakyThrows
    public void onStop(GameStoppingServerEvent event) {
        engine.disableEngine();
    }
}
