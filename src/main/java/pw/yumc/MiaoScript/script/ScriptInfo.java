package pw.yumc.MiaoScript.script;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;

import org.bukkit.configuration.ConfigurationSection;

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

    private String expression;
    @Nullable
    private String type;
    @Nullable
    private String trueResult;
    @Nullable
    private String falseResult;

    public ScriptInfo(final ConfigurationSection config) {
        super(config);
        if ("boolean".equalsIgnoreCase(type) && (trueResult == null || falseResult == null)) {
            Log.warning(String.format("脚本 %s 返回缺少返回结果!", config.getCurrentPath()));
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
                }
            } catch (final IOException e) {
                Log.warning(String.format("JS文件 %s 读取失败 异常: %s", fileName, e.getMessage()));
                expression = "";
            }
        }
    }

    /**
     * @return 表达式
     */
    public String getExpression() {
        return expression;
    }

    /**
     * @return False返回值
     */
    public String getFalseResult() {
        return falseResult;
    }

    /**
     * @return True返回值
     */
    public String getTrueResult() {
        return trueResult;
    }

    /**
     * @return 类型
     */
    public String getType() {
        return type;
    }
}
