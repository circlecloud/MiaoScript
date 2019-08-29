## MiaoChat for MiaoScript

![](https://dn-coding-net-production-pp.qbox.me/f459067b-7829-45ec-9713-bb559d1e0118.png)

> 注意: MiaoScript 在Windows环境下 暂不支持 reload 所以 Windows 环境请重启服务器
> 注意: MiaoScript 将不会计划兼容 非 `Sponge` 的MOD端

- 基于 `MiaoScript` 开发 同时兼容 `Sponge` 和 `Bukkit`
- 支持PAPI
  - `Bukkit` 为 `me.clip.placeholderapi.PlaceholderAPI`
  - `Sponge` 为 `me.rojo8399.placeholderapi.PlaceholderService`
- 支持悬浮提示
- 支持点击执行命令
- 支持点击命令补全

### Feature(开发规划)
- 悬浮物品提示
- 兼容 `BungeeCord` 支持跨服聊天
- 兼容其他聊天插件 保护插件

### 安装教程
- 下载 MiaoChat 本体并安装
  - [下载地址-论坛](http://www.mcbbs.net/thread-774401-1-1.html)
  - [下载地址-备用](https://git.yumc.pw/502647092/MiaoScript/releases)
- 安装到服务端对应的目录
  - Bukkit => plugins
  - Sponge => mods
- 重启服务器
- 下载 安装 `MiaoScriptPackageManager`
  - [安装教程](http://www.mcbbs.net/thread-774797-1-1.html)
- 使用 `MiaoScriptPackageManager` 安装插件
  - 执行 `mpm install MiaoChat` 即可安装成功