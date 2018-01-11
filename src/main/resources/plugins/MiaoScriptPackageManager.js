'use strict'
/*global Java, base, module, exports, require*/

var wrapper = require('api/wrapper')
var command = require('api/command')
var manager = require('api/plugin')
var task = require('api/task')

var http = require('http')
var fs = require('fs')

var pluginCache = []
var packageCache = []
var packageNameCache = []

var description = {
    name: 'MiaoScriptPackageManager',
    version: '1.0',
    author: '喵♂呜',
    description: 'MiaoScript包管理工具',
    commands: {
        'mpm': {
            description: 'MiaoScriptPackageManager主命令'
        }
    }
}

var help = [
    '==========   MiaoScript包管理工具   ==========',
    '/mpm list 查看现有插件列表',
    '/mpm install [插件名称] 安装插件',
    '/mpm update [插件名称] 更新缓存/更新插件'
]

function load() {
    task.async(function () {
        var result = http.get('https://ms.yumc.pw/api/package/list')
        JSON.parse(result).data.forEach(function cachePackageName(pkg) {
            packageCache[pkg.name] = pkg
            packageNameCache.push(pkg.name)
        })
        pluginCache = Object.keys(manager.plugins)
    })
}

function enable() {
    command.on(this, 'mpm', {
        cmd: function (sender, command, args) {
            if (args.length > 0) {
                switch (args[0]) {
                    case "list":
                        console.sender(sender, '§6当前 §bMiaoScriptPackageCenter §6中存在下列插件:')
                        for (var pkgName in packageCache) {
                            var pkg = packageCache[pkgName]
                            console.sender(sender, '§6插件名称: §b%s §6版本: §a%s'.format(pkg.name, pkg.version))
                        }
                        break
                    case "install":
                        if (args.length > 1) {
                            var pname = args[1];
                            var pkg = packageCache[pname]
                            if (pkg) {
                                task.async(function install() {
                                    var pfile = fs.file(__dirname, pname + '.js')
                                    console.sender(sender, '§6开始下载插件: §b%s'.format(pkg.name))
                                    console.sender(sender, '§6插件下载地址: §b%s'.format(pkg.url))
                                    fs.save(pfile, http.get(pkg.url))
                                    console.sender(sender, '§6插件 §b%s §a下载完毕 开始加载 ...'.format(pname))
                                    manager.loadPlugin(pfile)
                                    console.sender(sender, '§6插件 §b%s §a安装成功!'.format(pname))
                                })
                            } else {
                                console.log(sender, '§c插件 %s 不存在!'.format(pname))
                            }
                        } else {
                            console.log(sender, '§c请输入插件名称!')
                        }
                        break
                    case "update":
                        if (args.length > 1) {
                            
                        } else {
                            load()
                        }
                        break
                    case "upgrade":
                        break
                    case "delete":
                        if (args.length > 1) {
                            var pname = args[1]
                            if (pluginCache.indexOf(pname) !== -1) {
                                var plugin = manager.plugins[pname]
                                manager.disable(plugin)
                                fs.delete(plugin.__FILE__)
                            } else {
                                console.log(sender, '§c插件 %s 不存在!'.format(pname))
                            }
                        } else {
                            console.log(sender, '§c请输入插件名称!')
                        }
                        break
                    case "reload":
                        if (args.length > 1) {
                            var pname = args[1]
                            if (pluginCache.indexOf(pname) !== -1) {
                                manager.reload(pname)
                            } else {
                                console.log(sender, '§c插件 %s 不存在!'.format(pname))
                            }
                        } else {
                            
                        }
                        break
                }
            } else {

            }
        },
        tab: function (sender, command, args) {
            if (args.length === 1) return ['list', 'install', 'update', 'upgrade', 'reload']
            if (args.length > 1) {
                switch (args[0]) {
                    case "install":
                        return packageNameCache
                    case "update":
                    case "upgrade":
                    case "reload":
                        return pluginCache
                }
            }
        }
    })
}

function download(sender, name) {
    var plugin = packageCache[name]
    if (!plugin) {
        console.sender(sender, '§c插件§b', name, '§c不存在')
    }
}

function disable() {

}

module.exports = {
    description: description,
    load: load,
    enable: enable,
    disable: disable
}
