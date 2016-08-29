package pw.yumc.MiaoScript.script;

import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.bukkit.entity.Player;

import me.clip.placeholderapi.PlaceholderAPI;
import me.clip.placeholderapi.PlaceholderHook;
import pw.yumc.MiaoScript.ManagerCenter;
import pw.yumc.MiaoScript.MiaoScript;
import pw.yumc.MiaoScript.javascript.MiaoScriptEngine;
import pw.yumc.MiaoScript.misc.MLog;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;

/**
 * 脚本执行
 *
 * @author 喵♂呜
 * @since 2016年8月24日 下午12:51:59
 */
public class ScriptPlaceholder extends PlaceholderHook {
    private static String invalid = "无效的脚本: %s";
    private static String typeError = "脚本 %s 返回值错误";
    private static String EMPTY = "";

    private final MiaoScript plugin = P.getPlugin();
    private final ManagerCenter mCenter = plugin.getManagerCenter();

    private final ScriptEngine engine = MiaoScriptEngine.getDefault();

    @Override
    public String onPlaceholderRequest(final Player p, final String key) {
        final ScriptInfo script = mCenter.getScriptManager().getScript(key);
        if (script == null) {
            return EMPTY;
        }
        final String expression = script.getExpression(p);
        try {
            engine.put("Player", p);
            MLog.debug(String.format("执行脚本 %s 表达式如下: ", key));
            Object result = engine.eval(expression);
            engine.put("Event", null);
            engine.put("Player", null);
            engine.put("PlayerConfig", mCenter.getConfigManager());
            if (result == null) {
                return EMPTY;
            }
            if ("boolean".equalsIgnoreCase(script.getType())) {
                if (!(result instanceof Boolean)) {
                    return String.format(typeError, key);
                }
                if (((Boolean) result).booleanValue()) {
                    result = script.getTrueResult();
                } else {
                    result = script.getFalseResult();
                }
            }
            result = PlaceholderAPI.setPlaceholders(p, String.valueOf(result));
            MLog.debug(String.format("返回值: %s", result.toString()));
            return result.toString();
        } catch (final ScriptException ex) {
            Log.warning(String.format(invalid, key));
            ex.printStackTrace();
            return String.format(invalid, key);
        }
    }
}
