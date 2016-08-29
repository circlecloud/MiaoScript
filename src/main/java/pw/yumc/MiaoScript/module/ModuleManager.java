package pw.yumc.MiaoScript.module;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import pw.yumc.YumCore.bukkit.Log;
import pw.yumc.YumCore.bukkit.P;

/**
 * 模块管理
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:52:40
 */
public class ModuleManager {
    private static final String LOADERROR = "目录 %s 载入模块失败 异常: %s";
    private static final String LOADED = "已载入 %s 个模块...";
    private final File MODULE_FOLDER = new File(P.getDataFolder(), "modules");
    private final List<ModuleInfo> modules = new ArrayList<>();

    public ModuleManager() {
        if (!MODULE_FOLDER.exists()) {
            MODULE_FOLDER.mkdirs();
        }
    }

    public void loadModules() {
        modules.clear();
        int count = 0;
        for (final File dir : MODULE_FOLDER.listFiles()) {
            if (dir.isDirectory()) {
                try {
                    modules.add(new ModuleInfo(dir));
                    count++;
                } catch (final Exception e) {
                    Log.warning(String.format(LOADERROR, dir.getName(), e.getMessage()));
                    Log.debug("模块载入异常!", e);
                }
            }
        }
        Log.info(String.format(LOADED, count));
    }
}
