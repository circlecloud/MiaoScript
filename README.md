# MiaoScript

> 排版什么的 不存在的 这辈子都不会有排版的 除非什么时候论坛支持 `MarkDown` 了

### 简介

> 这个坑是我自己刨的 但是发现坑太大 需要更多的人一起填

#### 起源

- 诞生于 `2016年08月25日` 这是 Git 上的第一个提交 具体啥时候我也忘了
- 起初 `MiaoScript` 只是用于服务器其他插件的变量执行 并且依赖于PAPI(不知道是啥的自己百度)
  - 比如 [`MiaoMenu`](http://w.yumc.pw/zc/MiaoMenu.html) 的部分复杂脚本 
  - 比如 [`MiaoChat`](http://mcbbs.tvt.im/thread-631240-1-1.html) 的聊天变量
- 突然有一天 圈内的大佬 `QSB` @qiu1995 过来找我 说能不能用脚本监听玩家的事件
  - PS: 这货自从用过 `DeluxeMenu` 之后就喜欢上了用JS写菜单
- 当初感觉没啥问题 就出了第一个简易的 `MiaoScript` 版本 还是用 yml 做的配置文件
- 但是由于设计 BukkitAPI 等内容 对Java要求太高 后来 邱也弃坑了 我也弃坑了

#### 刨坑

- 时隔多年(也就一年) 看到了Sponge的兴起 (估摸着是MCPC系列的MOD端都弃坑了)
- 同时 这期间 收到很多腐竹的单子 但是又是非常基础的东西
  - 比如 开服给玩家发一条消息啦
  - 比如 修改玩家某些数据啦
- 这些东西实际上也就几行代码的事情
- 同时 很多想入坑 插件开发 但是又有一些被卡死在环境搭建上
  - 比如 `Bukkit` 需要 `BukkitAPI`
  - `Sponge` 需要 `SpongeAPI` 如果涉及 `MOD` 还要 `Forge` 环境
  - 再或者 BungeeCord 的插件开发 我也是经常懒得搞
- 当然 最主要的是 某个 咕咕咕的群 天天有人问我 喵系插件能不能支持 Sponge
  - 内心当然是拒绝的 现在要上班养老婆孩子(咳咳 不要以为我是大叔 我也才刚毕业而已) 那里还有时间免费给你们写插件
- 于是乎 我又想起了当初的 `MiaoScript`
- 突发奇想 一个插件的雏形出现在我的脑海中
  - 可以兼容多种服务器
  - 不需要开发环境 有记事本就可以开发
  - 语法要简单 比如 JavaScript
  - 能够自动搜索安装依赖(毕竟很多人天天问我为何喵系插件跑不起来 都是缺少PAPI)
  - 能够不重启更新插件(当然得保证代码安全的前提下)
- 在 2017年9月14号(距离 第一个版本正式版发布(2016-09-21) 相差一年整)
- 一个全新的 `MiaoScript` 诞生了
  - Java部分代码 只有一个启动类
  - 核心全部由 JS 编写
  - 兼容 `CommonJS` 规范
  - 实时重载
  - 不兼容 MOD 服 (咳咳 当然现在已经支持了)
  - 基础结构如下

  ```txt
    └─src
       └─main
         ├─java 引导类
         └─resources
             ├─bios.js     核心启动类 用于释放文件和初始化
             ├─api         全平台兼容的接口
             ├─core        核心代码 例如 require 模块
             │  └─ext      扩展代码 例如 Object.toJson()
             ├─internal    内部实现 用于各个平台实现API
             │  ├─bukkit   BukkitAPI内部实现
             │  └─sponge   SpongeAPI内部实现
             ├─modules     JS模块 例如 js-yaml, http 等
             └─plugins     这里当然是插件啦
                 ├─bukkit  只兼容bukkit的插件
                 ├─sponge  只兼容Sponge的插件
                 └─ext     插件扩展类库 用于多个插件共用代码 当然最好是是用 `modules` 啦
  ```
- 没错 第一个版本只兼容了 BukkitAPI
  - 我还用 `MiaoScript` 给某位腐竹写了一个抽奖插件
  - 当时因为没解决 MOD 服兼容问题 所以就退款了 放上[源码](http://paste.yumc.pw/pknd8q6e1)
  - 由于当时没有封装相关的API所以很多方法是直接调用了 `Bukkit` 原生的代码
  - 所以不兼容 `Sponge`

### 进展

- [项目发布](https://git.yumc.pw/502647092/MiaoScript/releases)
- [项目代码](https://git.yumc.pw/502647092/MiaoScript)
- [项目脑图](http://naotu.baidu.com/file/293b9a0fc7cef23c69de81c55e3617d5?token=1eee8fd759198eb7)

### 规划

- 初期只会支持JS类型的插件开发
- 二期会出一个建议版本的MS脚本 可以用简单的语法实现简单的功能
- 各个层级会有依赖控制 比如 `MS脚本 => JS脚本 => 调用Java原生API`

### 填坑

- 实际上说了那么多 最终希望的就是 有大佬能一起来填坑 毕竟这个坑太大了
