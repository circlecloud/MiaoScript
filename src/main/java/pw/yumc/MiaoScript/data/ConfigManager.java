package pw.yumc.MiaoScript.data;

import java.io.File;
import java.util.WeakHashMap;

import pw.yumc.YumCore.config.FileConfig;
import pw.yumc.YumCore.config.PlayerConfig;

/**
 * 配置管理
 *
 * @author 喵♂呜
 * @since 2016年8月25日 上午2:02:03
 */
public class ConfigManager {
    private final File dir;
    private final WeakHashMap<String, PlayerConfig> playerconfigs = new WeakHashMap<>();

    private FileConfig config = null;

    public ConfigManager(final File dir) {
        this.dir = dir;
        final File f = new File(dir, "config.yml");
        if (f.exists()) {
            this.config = new FileConfig(f);
        }
    }

    /**
     * @return 数据配置
     */
    public FileConfig get() {
        return config;
    }

    /**
     * @return 数据配置
     */
    public FileConfig get(final String name) {
        if (!playerconfigs.containsKey(name)) {
            playerconfigs.put(name, new PlayerConfig(dir, name));
        }
        return playerconfigs.get(name);
    }

    /**
     * 保存数据
     */
    public void save() {
        config.save();
    }
}
