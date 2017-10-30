package pw.yumc.MiaoScript;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import javax.script.ScriptException;

import org.slf4j.Logger;
import org.spongepowered.api.Sponge;
import org.spongepowered.api.command.CommandResult;
import org.spongepowered.api.command.args.GenericArguments;
import org.spongepowered.api.command.spec.CommandSpec;
import org.spongepowered.api.config.ConfigDir;
import org.spongepowered.api.event.Listener;
import org.spongepowered.api.event.game.state.GameInitializationEvent;
import org.spongepowered.api.event.game.state.GameStartedServerEvent;
import org.spongepowered.api.plugin.Plugin;
import org.spongepowered.api.text.Text;

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
    public void onInit(GameInitializationEvent event) {

    }

    private CommandSpec main() {
        return CommandSpec.builder()
                          .description(Text.of("喵式脚本主命令"))
                          .permission("MiaoScript.admin")
                          .child(js(), "js")
                          .child(file(), "file")
                          .child(reload(), "reload")
                          .build();
    }

    private CommandSpec js() {
        return CommandSpec.builder()
                          .description(Text.of("执行JS命令"))
                          .arguments(GenericArguments.onlyOne(GenericArguments.remainingJoinedStrings(Text.of("js"))))
                          .executor((src, args) -> {
                              try {
                                  engine.getEngine().eval(args.<String>getOne("js").orElse(""));
                              } catch (ScriptException e) {
                                  e.printStackTrace();
                              }
                              return CommandResult.success();
                          })
                          .build();
    }

    private CommandSpec file() {
        return CommandSpec.builder()
                          .description(Text.of("执行JS文件"))
                          .arguments(GenericArguments.onlyOne(GenericArguments.remainingJoinedStrings(Text.of("js"))))
                          .executor((src, args) -> {
                              try {
                                  engine.getEngine().eval(new FileReader(new File(pluginConfigDir, args.<String>getOne("js").orElse(""))));
                              } catch (ScriptException | IOException e) {
                                  e.printStackTrace();
                              }
                              return CommandResult.success();
                          })
                          .build();
    }

    private CommandSpec reload() {
        return CommandSpec.builder()
                          .description(Text.of("重载 JS 引擎"))
                          .executor((src, args) -> {
                              engine.disableEngine();
                              Sponge.getEventManager().unregisterPluginListeners(this);
                              engine.enableEngine();
                              // src.sendMesssage("§6[§bMiaoScript§6]§r §bMiaoScript §eEngine §a重启完成!");
                              return CommandResult.success();
                          })
                          .build();
    }

    @Listener
    @SneakyThrows
    public void onStart(GameStartedServerEvent event) {
        Sponge.getServer().getConsole();
        Sponge.getCommandManager().register(this, main(), "ms", "mscript", "MiaoScript");
        engine = new ScriptEngine(pluginConfigDir.getCanonicalPath(), logger);
    }
}
