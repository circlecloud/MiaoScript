package pw.yumc.MiaoScript.module;

import java.io.File;

import pw.yumc.YumCore.config.InjectConfig;

/**
 * 主模块信息
 * 
 * @author 喵♂呜
 * @since 2016年8月29日 上午7:52:25
 */
public class MainInfo extends InjectConfig {
    private String name;
    private String description;

    public MainInfo(final File file) {
        super(file);
    }

    /**
     * @return 模块描述
     */
    public String getDescription() {
        return description;
    }

    /**
     * @return 模块名称
     */
    public String getName() {
        return name;
    }

}
