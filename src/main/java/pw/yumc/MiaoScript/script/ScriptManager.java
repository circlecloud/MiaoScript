package pw.yumc.MiaoScript.script;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.bukkit.configuration.ConfigurationSection;

import cn.citycraft.PluginHelper.kit.Log;

/**
 * 脚本管理
 *
 * @author 喵♂呜
 * @since 2016年8月24日 下午12:51:48
 */
public class ScriptManager {
    Map<String, ScriptInfo> scripts = new HashMap<>();

    public ScriptManager(final ConfigurationSection config) {
        final Set<String> keys = config.getKeys(false);
        for (final String key : keys) {
            scripts.put(key, new ScriptInfo(config.getConfigurationSection(key)));
        }
        Log.info(String.format("已加载 %s 个变量...", keys.size()));
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
}
