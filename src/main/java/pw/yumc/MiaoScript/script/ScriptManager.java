package pw.yumc.MiaoScript.script;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.script.ScriptException;

import org.bukkit.Bukkit;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerCommandPreprocessEvent;

import pw.yumc.MiaoScript.javascript.MiaoScriptEngine;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;

/**
 * 脚本管理
 *
 * @author 喵♂呜
 * @since 2016年8月24日 下午12:51:48
 */
public class ScriptManager implements Listener {
    private static final String SCRIPTLOADED = "已加载全局变量/脚本 %s 个...";
    private static final String CMD_FUNCTION = "process";
    private static final String PROCESS_NOT_FOUND = "命令脚本 %s 脚本未包含 process(Player,Command,Args) 函数!";
    private static final String INVIDE_SCRIPT = "命令脚本 %s 语法错误: %s";
    private static final String REGISTER = "命令 %s 已绑定脚本 %s ...";
    private final ConfigurationSection config;
    private final Map<String, ScriptInfo> cmds = new HashMap<>();
    private final Map<String, ScriptInfo> scripts = new HashMap<>();

    public ScriptManager(final ConfigurationSection config) {
        this.config = config;
        Bukkit.getPluginManager().registerEvents(this, P.instance);
    }

    /**
     * 获取脚本信息
     *
     * @param name
     *            获得脚本
     * @return 脚本信息
     */
    public ScriptInfo getScript(final String name) {
        return scripts.get(name);
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onPreCommand(final PlayerCommandPreprocessEvent e) {
        final String command = e.getMessage().substring(1);
        final String[] temp = command.split(" ");
        final String cmd = temp[0];
        if (cmds.containsKey(cmd)) {
            e.setCancelled(true);
            Bukkit.getScheduler().runTaskAsynchronously(P.instance, new Runnable() {
                @Override
                public void run() {
                    final MiaoScriptEngine engine = MiaoScriptEngine.getDefault();
                    final ScriptInfo script = cmds.get(cmd);
                    final String[] args = Arrays.copyOfRange(temp, 1, temp.length);
                    try {
                        if (script.getModule() != null) {
                            engine.put("Config", script.getModule().getConfigManager().get());
                            engine.put("PlayerConfig", script.getModule().getConfigManager());
                        }
                        engine.eval(script.getExpression(e.getPlayer()));
                        engine.invokeFunction(CMD_FUNCTION, new Object[] { e.getPlayer(), cmd, args });
                    } catch (final NoSuchMethodException e1) {
                        Log.warning(String.format(PROCESS_NOT_FOUND, script.getName()));
                    } catch (final ScriptException e1) {
                        Log.warning(String.format(INVIDE_SCRIPT, script.getName(), e1.getMessage()));
                    }
                }
            });
        }
    }

    /**
     * 注册脚本
     *
     * @param name
     *            脚本名称
     * @param script
     *            脚本信息
     * @return
     */
    public ScriptInfo register(final ScriptInfo script) {
        if (script.getCommands() != null) {
            for (final String cmd : script.getCommands()) {
                cmds.put(cmd, script);
                Log.debug(String.format(REGISTER, cmd, script.getName()));
            }
        }
        return scripts.put(script.getName(), script);
    }

    /**
     * 注册脚本
     */
    public void registerAll() {
        scripts.clear();
        final Set<String> keys = config.getKeys(false);
        for (final String key : keys) {
            register(new ScriptInfo(key, config.getConfigurationSection(key)));
        }
        Log.info(String.format(SCRIPTLOADED, keys.size()));
    }
}
