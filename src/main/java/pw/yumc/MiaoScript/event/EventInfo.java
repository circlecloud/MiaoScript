package pw.yumc.MiaoScript.event;

import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import org.bukkit.command.CommandSender;
import org.bukkit.configuration.ConfigurationSection;

import pw.yumc.MiaoScript.module.ModuleInfo;
import pw.yumc.MiaoScript.script.ScriptInfo;
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
    private transient ModuleInfo module;
    @ConfigNode("class")
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
     * @return 获得上层Module 可能为Null
     */
    public ModuleInfo getModule() {
        return module;
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

    /**
     * 发送事件信息
     *
     * @param sender
     *            命令发送者
     */
    public void send(final CommandSender sender) {
        sender.sendMessage(String.format("§6名称: §a%s §6事件: §a%s §6优先级: §a%s", getName(), getClazz().substring(getClazz().lastIndexOf(".") + 1), getPriority()));
        sender.sendMessage("§6脚本列表: ");
        for (final String script : getScripts()) {
            sender.sendMessage(String.format("§6- §e%s", script));
        }
    }

    /**
     * @param module
     *            设置上层Module
     * @return {@link ScriptInfo}
     */
    public EventInfo setModule(final ModuleInfo module) {
        this.module = module;
        return this;
    }
}
