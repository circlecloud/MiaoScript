package pw.yumc.MiaoScript.module;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.bukkit.configuration.InvalidConfigurationException;
import org.bukkit.event.Listener;

import pw.yumc.MiaoScript.ManagerCenter;
import pw.yumc.MiaoScript.MiaoScript;
import pw.yumc.MiaoScript.data.ConfigManager;
import pw.yumc.MiaoScript.event.EventInfo;
import pw.yumc.MiaoScript.script.ScriptInfo;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.config.FileConfig;

/**
 * 模块信息
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:52:32
 */
public class ModuleInfo implements Listener {
    private static final String LOADINFO = "已加载模块 %s 包含脚本/变量 %s 个 事件 %s 个...";
    private static String MAIN = "main.yml";
    private static String EVENT = "event.yml";
    private static String SCRIPT = "script.yml";

    private final File dataFolder;
    private final ConfigManager configManager;
    private MainInfo main;
    private List<EventInfo> events = Collections.emptyList();
    private List<ScriptInfo> scripts = Collections.emptyList();

    public ModuleInfo(final File dir) throws FileNotFoundException, InvalidConfigurationException {
        if (!dir.isDirectory()) {
            throw new IllegalArgumentException("模块必须是一个目录!");
        }
        this.dataFolder = dir;
        this.configManager = new ConfigManager(dir);
        load(dir);
        register();
    }

    /**
     * @return 配置管理器
     */
    public ConfigManager getConfigManager() {
        return configManager;
    }

    /**
     * @return 模块数据目录
     */
    public File getDataFolder() {
        return dataFolder;
    }

    /**
     * @return 模块注册的事件
     */
    public List<EventInfo> getEvents() {
        return events;
    }

    /**
     * @return 获得模块主类
     */
    public MainInfo getMain() {
        return main;
    }

    /**
     * @return 获得模块脚本
     */
    public List<ScriptInfo> getScripts() {
        return scripts;
    }

    /**
     * 载入模块
     *
     * @param dir
     *            模块目录
     * @throws FileNotFoundException
     *             主类未找到
     * @throws InvalidConfigurationException
     *             主类配置文件错误
     */
    private void load(final File dir) throws FileNotFoundException, InvalidConfigurationException {
        final File mainFile = new File(dir, MAIN);
        if (!mainFile.exists()) {
            throw new FileNotFoundException(String.format("模块主文件 %s 未找到!", MAIN));
        }
        try {
            main = new MainInfo(mainFile);
        } catch (final Exception e) {
            throw new InvalidConfigurationException(String.format("模块主文件 %s 格式错误!", MAIN), e);
        }
        final File eventFile = new File(dir, EVENT);
        if (eventFile.exists()) {
            events = loadEvents(eventFile);
        }
        final File scriptFile = new File(dir, SCRIPT);
        if (scriptFile.exists()) {
            scripts = loadScripts(scriptFile);
        }
    }

    /**
     * 载入事件
     *
     * @param file
     *            模块目录
     * @return 事件列表
     */
    private List<EventInfo> loadEvents(final File file) {
        final List<EventInfo> eis = new ArrayList<>();
        final FileConfig cfg = new FileConfig(file);
        for (final String ek : cfg.getKeys(false)) {
            eis.add(new EventInfo(ek, cfg.getConfigurationSection(ek)).setModule(this));
        }
        return eis;
    }

    /**
     * 载入脚本
     *
     * @param file
     *            模块目录
     * @return 脚本列表
     */
    private List<ScriptInfo> loadScripts(final File file) {
        final List<ScriptInfo> sis = new ArrayList<>();
        final FileConfig cfg = new FileConfig(file);
        for (final String sk : cfg.getKeys(false)) {
            sis.add(new ScriptInfo(sk, cfg.getConfigurationSection(sk), file.getParentFile()).setModule(this));
        }
        return sis;
    }

    private void register() {
        final MiaoScript m = P.getPlugin();
        final ManagerCenter mc = m.getManagerCenter();
        Log.info(String.format(LOADINFO, main.getName(), registerScripts(mc), registerEvents(mc)));
    }

    private int registerEvents(final ManagerCenter mc) {
        int count = 0;
        for (final EventInfo eventInfo : events) {
            if (!eventInfo.getScripts().isEmpty() && mc.getEventManager().register(eventInfo, this)) {
                count++;
            }
        }
        return count;
    }

    private int registerScripts(final ManagerCenter mc) {
        int count = 0;
        for (final ScriptInfo scriptInfo : scripts) {
            mc.getScriptManager().register(scriptInfo);
            count++;
        }
        return count;
    }
}
