package pw.yumc.MiaoScript;

import org.bukkit.configuration.ConfigurationSection;

import pw.yumc.MiaoScript.data.ConfigManager;
import pw.yumc.MiaoScript.data.SQLManager;
import pw.yumc.MiaoScript.event.EventManager;
import pw.yumc.MiaoScript.module.ModuleManager;
import pw.yumc.MiaoScript.script.ScriptManager;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.config.FileConfig;

/**
 * 管理中心
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:50:50
 */
public class ManagerCenter {
    private final MiaoScript plugin = P.getPlugin();
    private final ConfigurationSection dbCfg;
    private final SQLManager sqlManager;
    private final EventManager eventManager;
    private final ModuleManager moduleManager;
    private final ConfigManager configManager;
    private final ScriptManager scriptManager;

    public ManagerCenter() {
        dbCfg = plugin.getConfig().getConfigurationSection("DataBase");
        configManager = new ConfigManager(P.getDataFolder());
        sqlManager = new SQLManager(dbCfg);
        eventManager = new EventManager(new FileConfig("event.yml"));
        scriptManager = new ScriptManager(new FileConfig("script.yml"));
        moduleManager = new ModuleManager();
    }

    /**
     * @return 配置管理
     */
    public ConfigManager getConfigManager() {
        return configManager;
    }

    /**
     * @return 事件管理
     */
    public EventManager getEventManager() {
        return eventManager;
    }

    /**
     * @return 模块管理
     */
    public ModuleManager getModuleManager() {
        return moduleManager;
    }

    /**
     * @return 脚本管理
     */
    public ScriptManager getScriptManager() {
        return scriptManager;
    }

    /**
     * @return 数据管理
     */
    public SQLManager getSQLManager() {
        return sqlManager;
    }

}
