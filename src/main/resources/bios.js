'use strict';
var boot;
var disable;
/**
 * 初始化框架引擎
 */
(function () {
    boot = function (plugin) {
        // 开发环境下初始化
        var root = "src/main/resources";
        if (plugin !== null) {
            // noinspection JSUnresolvedVariable
            root = plugin.dataFolder.canonicalPath;
        }
        load(root + '/core/init.js');
        try {
            init(root, plugin);
        } catch (ex) {
            log.w("MiaoScript 初始化失败! %s", ex);
            throw ex;
        } finally {
            disable = disablePlugins
        }
    };
})();