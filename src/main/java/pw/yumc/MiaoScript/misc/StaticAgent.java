package pw.yumc.MiaoScript.misc;

import org.bukkit.World;
import org.bukkit.entity.Player;

import pw.yumc.YumCore.bukkit.compatible.C;

/**
 * 静态方法代理
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:52:10
 */
public class StaticAgent {
    public static class ActionBar {
        public void broadcast(final String msg) {
            C.ActionBar.broadcast(msg);
        }

        public void broadcast(final String msg, final int time) {
            C.ActionBar.broadcast(msg, time);
        }

        public void broadcast(final World world, final String msg, final int time) {
            C.ActionBar.broadcast(world, msg, 0);
        }

        public void send(final Player player, final String msg) {
            C.ActionBar.send(player, msg);
        }

        public void send(final Player player, final String msg, final int time) {
            C.ActionBar.send(player, msg, time);
        }
    }

    public static class Title {
        public void send(final Player player, final String title, final String sub) {
            C.Title.send(player, title, sub);
        }

        public void send(final Player player, final String title, final String sub, final int fadeInTime, final int stayTime, final int fadeOutTime) {
            C.Title.send(player, title, sub, fadeInTime, stayTime, fadeOutTime);
        }
    }
}
