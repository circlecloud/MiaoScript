package pw.yumc.MiaoScript.script;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.bukkit.command.CommandSender;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.entity.Player;

import me.clip.placeholderapi.PlaceholderAPI;
import me.clip.placeholderapi.PlaceholderAPIPlugin;
import pw.yumc.MiaoScript.module.ModuleInfo;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.config.InjectConfigurationSection;
import pw.yumc.YumCore.config.Nullable;

/**
 * 脚本信息
 *
 * @author 喵♂呜
 * @since 2016年8月24日 下午12:52:09
 */
public class ScriptInfo extends InjectConfigurationSection {
    public transient static final File dir = new File(P.getDataFolder(), "js");
    public transient static Charset UTF_8 = Charset.forName("UTF-8");

    static {
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    private transient String name;
    private transient ModuleInfo module;
    private String expression;
    @Nullable
    private List<String> commands;
    @Nullable
    private String type;
    @Nullable
    private String trueResult;
    @Nullable
    private String falseResult;

    public ScriptInfo(final String name, final ConfigurationSection config) {
        this(name, config, dir);
    }

    public ScriptInfo(final String name, final ConfigurationSection config, final File dir) {
        super(config);
        this.name = name;
        if ("boolean".equalsIgnoreCase(type) && (trueResult == null || falseResult == null)) {
            Log.warning(String.format("脚本 %s 缺少返回结果 将使用默认值!", name));
        }
        if (expression.startsWith("file:")) {
            final String fileName = expression.substring(5).trim();
            try {
                final File file = new File(dir, fileName);
                if (!file.exists()) {
                    file.createNewFile();
                    Log.warning(String.format("JS文件 %s 不存在 已创建新文件 请添加脚本信息!", fileName));
                } else {
                    expression = new String(Files.readAllBytes(file.toPath()), UTF_8);
                    Log.debug(String.format("脚本 %s 从文件 %s 载入表达式...", name, file.toPath()));
                }
            } catch (final IOException e) {
                Log.warning(String.format("JS文件 %s 读取失败 异常: %s", fileName, e.getMessage()));
                expression = "";
            }
        }
    }

    /**
     * @return 当前脚本绑定的命令
     */
    public List<String> getCommands() {
        if (commands == null) {
            commands = Collections.emptyList();
        }
        return commands;
    }

    /**
     * @return 表达式
     */
    public String getExpression() {
        return expression;
    }

    /**
     * 获得PAPI解析的表达式
     *
     * @param p
     *            玩家
     * @return 获得解析后的表达式
     */
    public String getExpression(final Player p) {
        return PlaceholderAPI.setBracketPlaceholders(p, expression);
    }

    /**
     * @return False返回值
     */
    public String getFalseResult() {
        return falseResult == null ? PlaceholderAPIPlugin.booleanFalse() : falseResult;
    }

    /**
     * @return 获得上层Module
     */
    public ModuleInfo getModule() {
        return module;
    }

    /**
     * @return 脚本名称
     */
    public String getName() {
        return name;
    }

    /**
     * @return True返回值
     */
    public String getTrueResult() {
        return trueResult == null ? PlaceholderAPIPlugin.booleanTrue() : trueResult;
    }

    /**
     * @return 类型
     */
    public String getType() {
        return type == null ? "string" : type;
    }

    /**
     * 发送脚本信息
     *
     * @param sender
     *            命令接受者
     */
    public void send(final CommandSender sender) {
        sender.sendMessage(String.format("§6名称: §a%s §6返回值类型: §a%s §6表达式如下: ", getName(), getType()));
        for (final String exp : expression.split("\n")) {
            sender.sendMessage("§a" + exp);
        }
        final List<String> cmd = getCommands();
        if (!cmd.isEmpty()) {
            sender.sendMessage(String.format("§6绑定命令: §a%s", Arrays.toString(cmd.toArray())));
        }
        if ("boolean".equalsIgnoreCase(type)) {
            sender.sendMessage(String.format("§6true返回值: §a%s", getTrueResult()));
            sender.sendMessage(String.format("§6False返回值: §a%s", getFalseResult()));
        }
    }

    /**
     * @param module
     *            设置上层Module
     * @return {@link ScriptInfo}
     */
    public ScriptInfo setModule(final ModuleInfo module) {
        this.module = module;
        return this;
    }
}
