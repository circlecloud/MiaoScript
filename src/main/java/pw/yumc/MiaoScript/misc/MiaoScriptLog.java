package pw.yumc.MiaoScript.misc;

import pw.yumc.YumCore.bukkit.Log;

/**
 * 喵式脚本日志
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:51:53
 */
public class MiaoScriptLog {
    private boolean debug;

    /**
     * 输出调试消息
     *
     * @param msg
     *            调试消息
     */
    public void debug(final String msg) {
        if (debug) {
            Log.info(msg);
        }
    }

    /**
     * 输出调试消息
     *
     * @param msg
     *            调试消息
     */
    public void debug(final String[] msgs) {
        if (debug) {
            for (final String msg : msgs) {
                Log.info(msg);
            }
        }
    }

    public boolean isDebug() {
        return debug;
    }

    public void setDebug(final boolean debug) {
        this.debug = debug;
    }
}
