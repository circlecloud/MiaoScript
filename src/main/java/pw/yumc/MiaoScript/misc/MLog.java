package pw.yumc.MiaoScript.misc;

/**
 * 喵日志
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:52:02
 */
public class MLog {
    public static MiaoScriptLog LOG = new MiaoScriptLog();
    private static boolean debug = false;

    /**
     * 输出调试消息
     *
     * @param msg
     *            调试消息
     */
    public static void debug(final String msg) {
        LOG.debug(msg);
    }

    /**
     * 输出调试消息
     *
     * @param msg
     *            调试消息
     */
    public static void debug(final String[] msg) {
        LOG.debug(msg);
    }

    /**
     * @return 是否为调试模式
     */
    public static boolean isDebug() {
        return debug;
    }

    /**
     * 设置调试模式
     *
     * @param debug
     *            是否调试
     */
    public static void setDebug(final boolean debug) {
        LOG.setDebug(debug);
        MLog.debug = debug;
    }
}
