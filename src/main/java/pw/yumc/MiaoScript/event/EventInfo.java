package pw.yumc.MiaoScript.event;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import org.bukkit.configuration.ConfigurationSection;

import pw.yumc.YumCore.config.ConfigNode;
import pw.yumc.YumCore.config.InjectConfigurationSection;

/**
 * 事件信息
 *
 * @author 喵♂呜
 * @since 2016年8月24日 下午1:06:34
 */
public class EventInfo extends InjectConfigurationSection {
    private transient String name;
    @ConfigNode(path = "class")
    private String clazz;
    private String priority;
    private List<String> scripts;

    public EventInfo(final String name, final ConfigurationSection config) {
        super(config);
        this.name = name;
        clearEmpty();
    }

    /**
     * 清理空字串脚本
     *
     * @param scripts
     *            脚本
     * @return 整理后的脚本
     */
    public void clearEmpty() {
        final Set<String> cq = new HashSet<>();
        for (final String s : scripts) {
            if (!s.trim().isEmpty()) {
                cq.add(s);
            }
        }
        scripts = new LinkedList<>(cq);
    }

    /**
     * @return 获得类名称
     */
    public String getClazz() {
        return clazz;
    }

    /**
     * @return 事件显示名称
     */
    public String getName() {
        return name;
    }

    /**
     * @return 监听等级
     */
    public String getPriority() {
        return priority == null || "".equalsIgnoreCase(priority) ? "NORMAL" : priority;
    }

    /**
     * @return 获得执行的脚本
     */
    public List<String> getScripts() {
        return scripts;
    }
}
