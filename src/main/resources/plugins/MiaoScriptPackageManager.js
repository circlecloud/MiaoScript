'use strict';
/*global Java, base, module, exports, require, __dirname, __filename, ScriptEngineContextHolder*/
var task = require('api/task');
var manager = require('api/plugin');
var command = require('api/command');

var fs = require('fs');
var http = require('http');
var template = require('template');

var pluginCache = [];
var packageCache = [];
var packageNameCache = [];

var description = {
    name: 'MiaoScriptPackageManager',
    version: '1.0',
    author: '喵♂呜',
    description: 'MiaoScript包管理工具',
    commands: {
        'mpm': {
            description: 'MiaoScriptPackageManager主命令'
        }
    },
    config: {
        center: 'https://ms.yumc.pw/api/package/list',
        template: 'http://paste.yumc.pw/pxus6ap6l/g7di8z/raw'
    }
};

var help = [
    '§6========= §6[§a' + description.name + '§6] 帮助 §aBy §b喵♂呜 §6=========',
    '§6/mpm §ainstall §e<插件名称> §6- §3安装插件',
    '§6/mpm §alist §6- §3列出仓库插件',
    '§6/mpm §aupdate §e<插件名称> §6- §3更新插件(无插件名称则更新源)',
    '§6/mpm §aupgrade §e<插件名称> §6- §3及时更新插件(update需要重启生效)',
    '§6/mpm §areload §e<插件名称> §6- §3重载插件(无插件名称则重载自身)',
    '§6/mpm §arun §e<JS代码> §6- §3运行JS代码',
    '§6/mpm §acreate §e<插件名称> [作者] [版本] [主命令] §6- §3通过模板创建名称',
    '§6/mpm §crestart §6- §4重启MiaoScript脚本引擎'
];

function load() {
    task.async(function () {
        pluginCache = Object.keys(manager.plugins);
        JSON.parse(http.get(self.config.center)).data.forEach(function cachePackageName(pkg) {
            packageCache[pkg.name] = pkg;
        })
        packageNameCache = Object.keys(packageCache);
    })
}

function enable() {
    command.on(this, 'mpm', {
        cmd: function (sender, command, args) {
            if (args.length > 0) {
                switch (args[0]) {
                    case "list":
                        console.sender(sender, '§6当前 §bMiaoScriptPackageCenter §6中存在下列插件:');
                        for (var pkgName in packageCache) {
                            var pkg = packageCache[pkgName];
                            console.sender(sender, '§6插件名称: §b%s §6版本: §a%s'.format(pkg.name, pkg.version))
                        }
                        break;
                    case "install":
                        if (args.length > 1) {
                            download(sender, args[1]);
                        } else {
                            console.sender(sender, '§c请输入插件名称!')
                        }
                        break;
                    case "update":
                        if (args.length > 1) {
                            update(sender, args[1]);
                        } else {
                            load();
                            console.sender(sender, "§a仓库缓存刷新成功 共存在 §b" + pluginCache.length + " §a个插件!")
                        }
                        break;
                    case "upgrade":
                        break;
                    case "delete":
                        if (args.length > 1) {
                            del(sender, args[1]);
                        } else {
                            console.sender(sender, '§c请输入插件名称!')
                        }
                        break;
                    case "reload":
                        if (args.length > 1) {
                            var pname = args[1];
                            if (pluginCache.indexOf(pname) !== -1) {
                                manager.reload(pname)
                            } else {
                                console.sender(sender, '§c插件 %s 不存在!'.format(pname))
                            }
                        } else {
                            self.reloadConfig();
                            load();
                        }
                        break;
                    case "restart":
                        try {
                            ScriptEngineContextHolder.disableEngine();
                            ScriptEngineContextHolder.enableEngine();
                            console.sender(sender, '§3MiaoScript Engine §6Reload §aSuccessful...');
                        } catch (ex) {
                            console.sender(sender, "§3MiaoScript Engine §6Reload §cError! ERR: " + ex);
                            console.ex(ex);
                        }
                        break;
                    case "run":
                        args.shift(1);
                        console.sender(sender, eval(args.join(' ')));
                        break;
                    case "create":
                        var name = args[1];
                        if (!name) {
                            console.sender(sender, '§4参数错误 /mpm create <插件名称> [作者] [版本] [主命令]');
                            return;
                        }
                        var result = template.create(http.get(self.config.template)).render({
                            name: name,
                            author: args[2] || 'MiaoWoo',
                            version: args[3] || '1.0',
                            command: args[4] || name.toLowerCase(),
                        });
                        fs.save(fs.file(__dirname, name + '.js'), result);
                        console.sender(sender, '§6插件 §a' + name +  ' §6已生成到插件目录...');
                        break;
                    case "help":
                        sendHelp(sender);
                        break;
                }
            } else {
                sendHelp(sender);
            }
        },
        tab: function (sender, command, args) {
            if (args.length === 1) return ['list', 'install', 'update', 'upgrade', 'reload', 'restart', 'run', 'help'];
            if (args.length > 1) {
                switch (args[0]) {
                    case "install":
                        return packageNameCache;
                    case "update":
                    case "upgrade":
                    case "reload":
                        return pluginCache;
                }
            }
        }
    })
}

function sendHelp(sender) {
    help.forEach(function (msg) {
        console.sender(sender, msg);
    })
}

function del(sender, name) {
    if (pluginCache.indexOf(name) !== -1) {
        console.sender(sender, '§c插件 %s 不存在!'.format(name));
        return;
    }
    manager.disable(name);
    fs.delete(plugin.__FILE__);
}

function download(sender, name) {
    var plugin = packageCache[name];
    if (!plugin) {
        console.sender(sender, '§c插件§b', name, '§c不存在');
        return;
    }
    var pfile = fs.file(__dirname, name + '.js');
    console.sender(sender, '§6开始下载插件: §b%s'.format(plugin.name));
    console.sender(sender, '§6插件下载地址: §b%s'.format(plugin.url));
    fs.save(pfile, http.get(plugin.url));
    console.sender(sender, '§6插件 §b%s §a下载完毕 开始加载 ...'.format(name));
    manager.loadPlugin(pfile);
    console.sender(sender, '§6插件 §b%s §a安装成功!'.format(name));
}

function disable() {

}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
};
