var boot;
/**
 * 初始化框架引擎
 */
(function () {
    boot = function (plugin, engine) {
        engine.put('root', plugin.getDataFolder());
        engine.put('rootDir', plugin.getDataFolder().getCanonicalPath());
        load(rootDir + '/modules/init.js');
        init(plugin, engine);
    }
})();