package pw.yumc.MiaoScript.script;

import java.util.WeakHashMap;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.Event;

import me.clip.placeholderapi.PlaceholderAPI;
import me.clip.placeholderapi.PlaceholderHook;
import pw.yumc.MiaoScript.MiaoScript;
import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;
import pw.yumc.YumCore.config.PlayerConfig;

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
    private ScriptEngine engine;
    private final WeakHashMap<String, PlayerConfig> playerdatas = new WeakHashMap<>();

    public ScriptPlaceholder() {
        this("javascript");
    }

    public ScriptPlaceholder(final String engineType) {
        try {
            engine = new ScriptEngineManager().getEngineByName(engineType);
        } catch (final NullPointerException ex) {
            Log.warning("无效的解析引擎! 已设为默认值 'javascript'");
            engine = new ScriptEngineManager().getEngineByName("javascript");
        }
        engine.put("Bukkit", Bukkit.getServer());
        engine.put("Server", Bukkit.getServer());
        engine.put("Data", plugin.getDataManager().getData());
        engine.put("Prefix", Log.getPrefix());
        engine.put("Log", P.getLogger());
    }

    @Override
    public String onPlaceholderRequest(final Player p, final String key) {
        final ScriptInfo script = plugin.getScriptManager().getScript(key);
        if (script == null) {
            return EMPTY;
        }
        String expression = script.getExpression();
        expression = PlaceholderAPI.setPlaceholders(p, expression);
        try {
            engine.put("Player", p);
            if (!playerdatas.containsKey(p.getName())) {
                playerdatas.put(p.getName(), new PlayerConfig(p));
            }
            engine.put("PlayerData", playerdatas.get(p.getName()));
            final Event event = plugin.getEventMiddleware().get(p);
            if (event != null) {
                engine.put("Event", event);
            }
            Object result = engine.eval(expression);
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
            return PlaceholderAPI.setPlaceholders(p, String.valueOf(result));
        } catch (final ScriptException ex) {
            Log.warning(String.format("脚本 %s 格式错误...", key));
            ex.printStackTrace();
            return String.format(invalid, key);
        }
    }
}
