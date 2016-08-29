package pw.yumc.MiaoScript.data;

import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.bukkit.Bukkit;
import org.bukkit.configuration.ConfigurationSection;

import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.sql.core.DataBaseCore;
import pw.yumc.YumCore.sql.core.MySQLCore;

/**
 * 数据库管理
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:51:10
 */
public class SQLManager {
    Map<String, DataBaseCore> database = new HashMap<>();

    public SQLManager(final ConfigurationSection cfg) {
        final Set<String> dbName = cfg.getKeys(false);
        for (final String db : dbName) {
            database.put(db, new MySQLCore(cfg.getConfigurationSection(db)));
        }
    }

    /**
     * 检查数据库连接
     */
    public void check() {
        Bukkit.getScheduler().runTaskAsynchronously(P.instance, new Runnable() {
            @Override
            public void run() {
                Log.info("检查数据库配置...");
                for (final Entry<String, DataBaseCore> entry : database.entrySet()) {
                    if (entry.getValue().getConnection() == null) {
                        Log.warning(String.format("数据库 %s 连接失败 请检查配置参数是否正确", entry.getKey()));
                    }
                }
            }
        });
    }

    /**
     * 获得数据库核心
     *
     * @param name
     *            数据库名称
     * @return {@link DataBaseCore}
     */
    public DataBaseCore get(final String name) {
        return database.get(name);
    }

}
