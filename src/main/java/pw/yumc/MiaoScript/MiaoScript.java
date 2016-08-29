package pw.yumc.MiaoScript;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Enumeration;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;

import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.event.HandlerList;
import org.bukkit.plugin.java.JavaPlugin;

import me.clip.placeholderapi.PlaceholderAPI;
import pw.yumc.MiaoScript.commands.MSCommands;
import pw.yumc.MiaoScript.javascript.MiaoScriptEngine;
import pw.yumc.MiaoScript.script.ScriptPlaceholder;
import pw.yumc.YumCore.config.FileConfig;

/**
 * 喵式脚本
 *
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:50:39
 */
public class MiaoScript extends JavaPlugin {
    private FileConfig config;
    private ManagerCenter managerCenter;

    @Override
    public FileConfiguration getConfig() {
        return config;
    }

    /**
     * @return 管理中心
     */
    public ManagerCenter getManagerCenter() {
        return managerCenter;
    }

    /**
     * 全局载入
     */
    public void load() {
        loadConfig();
        loadManager();
        loadScript();
        loadEvents();
        loadModules();
    }

    @Override
    public void onEnable() {
        load();
        register();
        new MSCommands();
        MiaoScriptEngine.getDefault();
    }

    @Override
    public void onLoad() {
        saveDefault();
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
        load();
    }

    private void loadConfig() {
        config = new FileConfig();
    }

    /**
     * 注册事件
     */
    private void loadEvents() {
        getManagerCenter().getEventManager().registerAll();
    }

    /**
     * 初始管理中心
     */
    private void loadManager() {
        managerCenter = new ManagerCenter();
    }

    /**
     * 载入模块
     */
    private void loadModules() {
        getManagerCenter().getModuleManager().loadModules();
    }

    /**
     * 载入脚本
     */
    private void loadScript() {
        getManagerCenter().getScriptManager().registerAll();
    }

    /**
     * 保存默认文件
     */
    private void saveDefault() {
        try {
            saveFile("js", "module");
        } catch (final IOException e) {
        }
    }

    /**
     * 保存案例
     *
     * @param name
     *            JS文件名称
     * @throws IOException
     */
    private void saveFile(final String... dirs) throws IOException {
        final URL url = getClassLoader().getResource("plugin.yml");
        final String upath = url.getFile().substring(url.getFile().indexOf("/") + 1);
        final String jarPath = upath.substring(0, upath.indexOf('!'));
        JarFile jar = null;
        jar = new JarFile(jarPath);
        final Enumeration<JarEntry> jes = jar.entries();
        while (jes.hasMoreElements()) {
            final JarEntry je = jes.nextElement();
            if (!je.isDirectory()) {
                for (final String dir : dirs) {
                    if (je.getName().startsWith(dir)) {
                        if (!new File(getDataFolder(), je.getName()).exists()) {
                            saveResource(je.getName(), false);
                        }

                    }
                }
            }
        }
        jar.close();
    }
}
