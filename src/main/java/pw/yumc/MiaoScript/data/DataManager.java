package pw.yumc.MiaoScript.data;

import pw.yumc.YumCore.config.FileConfig;

/**
 * 数据管理
 *
 * @author 喵♂呜
 * @since 2016年8月25日 上午2:02:03
 */
public class DataManager {
    FileConfig data;

    public DataManager(final FileConfig config) {
        this.data = config;
    }

    /**
     * @return 数据配置
     */
    public FileConfig getData() {
        return data;
    }

    /**
     * 保存数据
     */
    public void save() {
        data.save();
    }
}
