package pw.yumc.MiaoScript;

import java.io.File;

import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.event.HandlerList;
import org.bukkit.plugin.java.JavaPlugin;

import me.clip.placeholderapi.PlaceholderAPI;
import pw.yumc.MiaoScript.commands.MSCommands;
import pw.yumc.MiaoScript.data.DataManager;
import pw.yumc.MiaoScript.event.EventManager;
import pw.yumc.MiaoScript.middleware.EventMiddleware;
import pw.yumc.MiaoScript.script.ScriptManager;
import pw.yumc.MiaoScript.script.ScriptPlaceholder;
import pw.yumc.YumCore.config.FileConfig;

public class MiaoScript extends JavaPlugin {
    private FileConfig config;
    private DataManager dataManager;
    private EventManager eventManager;
    private EventMiddleware eventMiddleware;
    private ScriptManager scriptManager;

    @Override
    public FileConfiguration getConfig() {
        return config;
    }

    /**
     * @return 数据管理
     */
    public DataManager getDataManager() {
        return dataManager;
    }

    /**
     * @return 事件管理
     */
    public EventManager getEventManager() {
        return eventManager;
    }

    /**
     * @return 事件中间件
     */
    public EventMiddleware getEventMiddleware() {
        return eventMiddleware;
    }

    /**
     * @return 脚本管理
     */
    public ScriptManager getScriptManager() {
        return scriptManager;
    }

    /**
     * 载入数据与配置
     */
    public void loadConfig() {
        dataManager = new DataManager(new FileConfig("data.yml"));
        eventManager = new EventManager(new FileConfig("event.yml"));
        scriptManager = new ScriptManager(new FileConfig("script.yml"));
    }

    /**
     * 注册事件
     */
    public void loadEvents() {
        eventManager.registerAll();
    }

    @Override
    public void onEnable() {
        new MSCommands();
        loadConfig();
        loadEvents();
        register();
    }

    @Override
    public void onLoad() {
        saveDefault();
        config = new FileConfig();
        eventMiddleware = new EventMiddleware();
    }

    /**
     * 注册变量
     */
    public void register() {
        PlaceholderAPI.registerPlaceholderHook("miaoscript", new ScriptPlaceholder());
        PlaceholderAPI.registerPlaceholderHook("ms", new ScriptPlaceholder());
    }

    /**
     * 重新载入
     */
    public void reload() {
        HandlerList.unregisterAll(this);
        onLoad();
        loadConfig();
        loadEvents();
    }

    /**
     * 保存默认文件
     */
    private void saveDefault() {
        saveJs("bed.js");
        saveJs("welcome.js");
        saveJs("checkchat.js");
    }

    /**
     * 保存案例
     *
     * @param name
     *            JS文件名称
     */
    private void saveJs(final String name) {
        if (!new File(getDataFolder(), "js" + File.separatorChar + name).exists()) {
            saveResource("js" + File.separatorChar + name, false);
        }
    }
}
