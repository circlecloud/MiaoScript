/**
 * 符合 CommonJS 规范的 类似 Node 的模块化加载
 * 一. 注: MiaoScript 中 require.main 不存在
 * 二. 加载 require 流程 例如 在 dir 目录下 调用 require('xx');
 *   a) 加载流程
 *     1. 如果xx模块是一个內建模块
 *       a. 编译并返回该模块
 *       b. 停止执行
 *     2. 如果模块以 `./` `../` 开头
 *       a. 尝试使用 resolveAsFile(dir/xx) 加载文件
 *       b. 尝试使用 resolveAsDirectory(dir/xx) 加载目录
 *     3. 尝试去 root root/node_modules => xx 加载模块
 *       a. 尝试使用 resolveAsFile(xx/xx) 加载文件
 *       b. 尝试使用 resolveAsDirectory(xx/xx) 加载目录
 *     4. 抛出 not found 异常
 *   b) resolveAsFile 解析流程
 *     1. 如果 xx 是一个文件 则作为 `javascript` 文本加载 并停止执行
 *     2. 如果 xx.js 是一个文件 则作为 `javascript` 文本加载 并停止执行
 *     3. 如果 xx.json 是一个文件 则使用 `JSON.parse(xx.json)` 解析为对象加载 并停止执行
 *     暂不支持 4. 如果 xx.msm 是一个文件 则使用MScript解析器解析 并停止执行
 *   c) resolveAsDirectory 解析流程
 *     1. 如果 xx/package.json 存在 则使用 `JSON.parse(xx/package.json)` 解析并取得 main 字段使用 resolveAsFile(main) 加载
 *     2. 如果 xx/index.js 存在 则使用 resolveAsFile(xx/index.js) 加载
 *     3. 如果 xx/index.json 存在 则使用 `xx/index.json` 解析为对象加载 并停止执行
 *     暂不支持 4. 如果 xx/index.msm 是一个文件 则使用MScript解析器解析 并停止执行
 */
/// <reference path="./index.d.ts" />
// @ts-check
(
    /**
     * @param {string} parent
     */
    function (parent) {
        'use strict'
        var System = Java.type('java.lang.System')

        var File = Java.type('java.io.File')
        var Paths = Java.type('java.nio.file.Paths')
        var Files = Java.type('java.nio.file.Files')
        var StandardCopyOption = Java.type('java.nio.file.StandardCopyOption')

        var TarInputStream = Java.type('org.kamranzafar.jtar.TarInputStream')
        var GZIPInputStream = Java.type('java.util.zip.GZIPInputStream')
        var BufferedInputStream = Java.type('java.io.BufferedInputStream')

        var URL = Java.type('java.net.URL')
        var ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream")
        var ByteArray = Java.type("byte[]")
        var Thread = Java.type('java.lang.Thread')
        var Callable = Java.type('java.util.concurrent.Callable')
        var Executors = Java.type('java.util.concurrent.Executors')
        var TimeUnit = Java.type('java.util.concurrent.TimeUnit')
        var separatorChar = File.separatorChar

        var MS_NODE_PATH = System.getenv("MS_NODE_PATH") || root + separatorChar + 'node_modules'
        var MS_NODE_REGISTRY = System.getenv("MS_NODE_REGISTRY") || 'https://registry.npmmirror.com'
        var FALLBACK_NODE_REGISTRY = System.getenv("FALLBACK_NODE_REGISTRY") || 'https://repo.yumc.pw/repository/npm'
        var CoreModules = [
            "assert", "async_hooks", "Buffer", "child_process", "cluster", "crypto",
            "dgram", "dns", "domain", "events", "fs", "http", "http2", "https",
            "inspector", "net", "os", "path", "perf_hooks", "process", "punycode",
            "querystring", "readline", "repl", "stream", "string_decoder",
            "timer", "tls", "trace_events", "tty", "url", "util",
            "v8", "vm", "wasi", "worker_threads", "zlib"
        ]

        var ModulesVersionLock = {}

        /**
         * @param {...object} t
         */
        function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i]
                if (s === undefined) {
                    continue
                }
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                    t[p] = s[p]
            }
            return t
        }

        // noinspection JSValidateJSDoc
        /**
         * 判断是否为一个文件
         * @param {any} file
         * @returns {*}
         */
        function _isFile(file) {
            return file && file.isFile && file.isFile()
        }

        /**
         * 获得文件规范路径
         * @param {any} file
         * @returns {*}
         */
        function _canonical(file) {
            return file.canonicalPath
        }

        /**
         * 获得文件绝对路径
         * @param {any} file
         * @returns {*}
         */
        function _absolute(file) {
            return file.absolutePath
        }

        /**
         * 解析模块名称为文件
         * 按照下列顺序查找
         * 当前目录 ./
         * 父目录 ../
         * 递归模块目录 ../node_modules 到root
         * 寻找 ${NODE_PATH}
         * @param {string} name 模块名称
         * @param {string} parent 父目录
         * @param {any} optional 附加参数
         */
        function resolve(name, parent, optional) {
            name = _canonical(name) || name
            // 解析本地目录
            if (optional.local) {
                return resolveAsFile(name, parent) || resolveAsDirectory(name, parent) || undefined
            } else {
                // 解析Node目录
                var dir = [parent, 'node_modules'].join(separatorChar)
                return resolveAsFile(name, dir) || resolveAsDirectory(name, dir) ||
                    (parent && parent.toString().startsWith(root) ?
                        resolve(name, new File(parent).getParent(), optional) : resolveAsDirectory(name, MS_NODE_PATH) || undefined)
            }
        }

        /**
         * 解析文件
         * @param {any} file 文件
         * @param {string | undefined} dir 目录
         * @returns {*}
         */
        function resolveAsFile(file, dir) {
            file = dir !== undefined ? new File(dir, file) : new File(file)
            // 直接文件
            if (file.isFile()) {
                return file
            }
            // JS文件
            var js = new File(normalizeName(_absolute(file), '.js'))
            if (js.isFile()) {
                return js
            }
            // JSON文件
            var json = new File(normalizeName(_absolute(file), '.json'))
            if (json.isFile()) {
                return json
            }
        }

        /**
         * 解析目录
         * @param {string} file 文件
         * @param {string | undefined} dir 目录
         * @returns {*}
         */
        function resolveAsDirectory(file, dir) {
            dir = dir !== undefined ? new File(dir, file) : new File(file)
            var _package = new File(dir, 'package.json')
            if (_package.exists()) {
                var json = JSON.parse(base.read(_package))
                if (json.main) {
                    return resolveAsFile(json.main, dir)
                }
            }
            // if no package or package.main exists, look for index.js
            return resolveAsFile('index.js', dir)
        }

        /**
         * 后缀检测和添加
         * @param {string} fileName 文件名称
         * @param {string} ext 后缀
         * @returns {*}
         */
        function normalizeName(fileName, ext) {
            var extension = ext || '.js'
            if (fileName.endsWith(extension)) {
                return fileName
            }
            return fileName + extension
        }

        /**
         * 检查模块缓存
         * @param {string} id 模块ID
         * @param {any} file 模块文件
         * @param {any} optional 附加选项
         * @returns {Object}
         */
        function getCacheModule(id, file, optional) {
            var module = cacheModules[id]
            if (optional.cache && module) {
                return module
            }
            return createModule(id, file, optional)
        }

        /**
         * 编译模块
         * @param {string} id 模块ID
         * @param {any} file 模块文件
         * @param {any} optional 附加选项
         * @returns {Object}
         */
        function createModule(id, file, optional) {
            var filename = file.name
            var lastDotIndexOf = filename.lastIndexOf('.')
            if (lastDotIndexOf == -1) {
                throw Error('require ' + file + ' error: module must include file ext.')
            }
            var name = filename.substring(0, lastDotIndexOf)
            var ext = filename.substring(lastDotIndexOf + 1)
            var loader = requireLoaders[ext]
            if (!loader) {
                throw Error('Unsupported module ' + filename + '. require loader not found.')
            }
            console.trace('Loading module', name + '(' + id + ')', 'Optional', JSON.stringify(optional))
            var module = {
                id: id,
                name: name,
                ext: ext,
                exports: {},
                loaded: false,
                loader: loader,
                require: getRequire(file.parentFile, id),
                __dirname: file.parentFile,
                __filename: file
            }
            cacheModules[id] = module
            return loader(module, file, __assign(optional, { id: id }))
        }

        /**
         * 预编译JS
         * @param {any} module JS模块
         * @param {any} file JS文件
         * @param {any} optional 附加选项
         * @returns {any}
         */
        function compileJsFile(module, file, optional) {
            return compileJs(module, base.read(file), optional)
        }

        /**
         * 预编译JS
         * @param {any} module JS模块
         * @param {any} script JS脚本
         * @param {any} optional 附加选项
         * @returns {any}
         */
        function compileJs(module, script, optional) {
            if (optional.hook) {
                script = optional.hook(script)
            }
            if (optional.beforeCompile) {
                script = optional.beforeCompile(script)
            }
            // 2019-09-19 使用 扩展函数直接 load 无需保存/删除文件
            // 2020-02-16 结尾新增换行 防止有注释导致加载失败
            var wrapperScript = '(function (module, exports, require, __dirname, __filename) {' + script + '\n});'
            var compiledWrapper = engineLoad({
                script: wrapperScript,
                name: optional.id
            })
            compiledWrapper.apply(module.exports, [
                module, module.exports, module.require, module.__dirname, module.__filename
            ])
            module.loaded = true
            if (optional.afterCompile) {
                module = optional.afterCompile(module) || module
            }
            return module
        }

        /**
         * 预编译Json
         * @param {{ id?: string | null; exports?: {}; loaded: any; require?: any; }} module Json模块
         * @param {any} file Json 文件
         * @returns {any}
         */
        function compileJson(module, file) {
            module.exports = JSON.parse(base.read(file))
            module.loaded = true
            return module
        }

        /**
         * 尝试从网络下载依赖包
         * @param {string} name 包名称
         */
        function download(name) {
            // process package name
            // es6-map/implement => es6-map 
            // @ccms/common/dist/reflect => @ccms/common
            var name_arr = name.split('/')
            var module_name = name.startsWith('@') ? name_arr[0] + '/' + name_arr[1] : name_arr[0]
            var target = MS_NODE_PATH + separatorChar + module_name
            var _package = new File(target, 'package.json')
            if (_package.exists()) { return name }
            // at windows need replace file name java.lang.IllegalArgumentException: Invalid prefix or suffix
            var info = fetchPackageInfo(module_name)
            var latest_version = info['dist-tags']['latest']
            var version = ModulesVersionLock[module_name] || latest_version
            var _version = info.versions[version] || info.versions[latest_version]
            var url = _version.dist.tarball
            console.log('fetch node_module ' + module_name + ' version ' + version + ' waiting...')
            return executor.submit(new Callable(function () {
                var tis = new TarInputStream(new BufferedInputStream(new GZIPInputStream(new URL(url).openStream())))
                var entry
                while ((entry = tis.getNextEntry()) != null) {
                    var targetPath = Paths.get(target + separatorChar + entry.getName().substring(8))
                    var parentFile = targetPath.toFile().getParentFile()
                    if (!parentFile.isDirectory()) {
                        parentFile.delete()
                        parentFile.mkdirs()
                    }
                    Files.copy(tis, targetPath, StandardCopyOption.REPLACE_EXISTING)
                }
                return name
            }))
                // default wait 45 seconds
                .get(45, TimeUnit.SECONDS)
        }

        /**
         * @param {string} module_name
         */
        function fetchPackageInfo(module_name) {
            var content = ''
            try {
                content = fetchContent(MS_NODE_REGISTRY + '/' + module_name)
            } catch (ex) {
                console.warn('can\'t fetch package ' + module_name + ' from ' + MS_NODE_REGISTRY + ' registry. try fetch from ' + FALLBACK_NODE_REGISTRY + ' registry...')
                content = fetchContent(FALLBACK_NODE_REGISTRY + '/' + module_name)
            }
            return JSON.parse(content)
        }

        function fetchContent(url, timeout) {
            timeout = timeout || 10
            return executor.submit(new Callable(function fetchContent() {
                var input = new URL(url).openStream()
                var output = new ByteArrayOutputStream()
                var buffer = new ByteArray(1024)
                try {
                    var n
                    while ((n = input.read(buffer)) !== -1) {
                        output.write(buffer, 0, n)
                    }
                    return output.toString("UTF-8")
                } finally {
                    input.close()
                    output.close()
                }
            })).get(timeout, TimeUnit.SECONDS)
        }

        var lastModule = ''

        /**
         * 检查核心模块
         * @param {string} name
         * @param {string} path
         */
        function checkCoreModule(name, path, optional) {
            if (name.startsWith('@ms') && lastModule.endsWith('.js')) {
                console.warn(lastModule + ' load deprecated module ' + name + ' auto replace to ' + (name = name.replace('@ms', global.scope)) + '...')
                return name
            } else {
                lastModule = name
            }
            if (CoreModules.indexOf(name) !== -1) {
                var newName = global.scope + '/nodejs/dist/' + name
                if (resolve(newName, path, optional) !== undefined) {
                    return newName
                }
                throw new Error("Can't load nodejs core module " + name + " . maybe later will auto replace to " + global.scope + "/nodejs/" + name + ' to compatible...')
            }
            return name
        }

        /**
         * 检查缓存模块
         */
        function checkCacheModule(optional) {
            return optional.local ? cacheModuleIds[optional.parentId] && cacheModuleIds[optional.parentId][optional.path] : cacheModuleIds[optional.path]
        }

        /**
         * 加载模块
         * @param {string} name 模块名称
         * @param {string} path 路径
         * @param {any} optional 附加选项
         * @returns {*}
         */
        function _require(name, path, optional) {
            // require direct file
            var file = _isFile(name) ? name : new File(name)
            if (_isFile(file)) {
                return _requireFile(file, optional)
            }
            // require cache module
            var cachePath = checkCacheModule(optional)
            var cacheFile = new File(cachePath)
            if (cachePath && cacheFile.exists()) {
                return _requireFile(cacheFile, optional)
            }
            // check core module
            name = checkCoreModule(name, path, optional)
            // search module
            if ((file = resolve(name, path, optional)) === undefined) {
                // excloud local dir, prevent too many recursive call and cache not found module
                if (optional.local || optional.recursive || notFoundModules[name]) {
                    throw new Error("Can't found module " + name + '(' + JSON.stringify(optional) + ') at local ' + path + ' or network!')
                }
                optional.recursive = true
                return _require(download(name), path, optional)
            }
            setCacheModule(file, optional)
            return _requireFile(file, optional)
        }

        /**
         * 设置模块缓存
         * @param {any} file
         * @param {any} optional
         */
        function setCacheModule(file, optional) {
            if (optional.local) {
                var parent = cacheModuleIds[optional.parentId]
                if (!parent) {
                    cacheModuleIds[optional.parentId] = {}
                }
                return cacheModuleIds[optional.parentId][optional.path] = _canonical(file)
            }
            return cacheModuleIds[optional.path] = _canonical(file)
        }

        function _requireFile(file, optional) {
            // 重定向文件名称和类型
            return getCacheModule(_canonical(file), file, optional)
        }

        /**
         * 闭包方法
         * @param {string} parent 父目录
         * @param {string} parentId
         * @returns {Function}
         */
        function exports(parent, parentId) {
            /**
             * @param {string} path
             * @param {any} optional
             */
            return function __DynamicRequire__(path, optional) {
                if (!path) {
                    throw new Error('require path can\'t be undefined or empty!')
                }
                return _require(path, parent, __assign({
                    cache: true,
                    parentId: parentId,
                    parent: parent,
                    path: path,
                    local: path.startsWith('.') || path.startsWith('/')
                }, optional)).exports
            }
        }

        /**
         * @param {string} path
         * @param {any} optional 附加选项
         */
        function __DynamicResolve__(path, optional) {
            return _canonical(new File(resolve(path, parent, __assign({
                cache: true,
                parent: parent,
                local: path.startsWith('.') || path.startsWith('/')
            }, optional))))
        }

        /**
         * @param {string} name
         */
        function __DynamicClear__(name) {
            for (var cacheModule in cacheModules) {
                if (cacheModule.indexOf(name) !== -1) {
                    console.trace('Clear module ' + cacheModule + ' ...')
                    delete cacheModules[cacheModule]
                }
            }
        }

        function __DynamicDisable__() {
            base.save(cacheModuleIdsFile, JSON.stringify(upgradeMode ? {} : cacheModuleIds))
            for (var cacheModule in cacheModules) {
                delete cacheModules[cacheModule]
            }
            cacheModules = undefined
            for (var cacheModuleId in cacheModuleIds) {
                delete cacheModuleIds[cacheModuleId]
            }
            cacheModuleIds = undefined
            notFoundModules = undefined
        }

        function __setUpgradeMode__(status) {
            upgradeMode = status
        }

        /**
         * @param {string} parent
         * @param {string} parentId
         */
        function getRequire(parent, parentId) {
            /**
             * @type {any} require
             */
            var require = exports(parent, parentId)
            require.resolve = __DynamicResolve__
            require.clear = __DynamicClear__
            require.disable = __DynamicDisable__
            require.setUpgradeMode = __setUpgradeMode__
            require.loader = {
                register: registerLoader,
                get: getLoader,
                unregister: unregisterLoader,
            }
            require.internal = {
                coreModules: CoreModules,
                cacheModules: cacheModules,
                cacheModuleIds: cacheModuleIds,
                notFoundModules: notFoundModules,
                requireLoaders: requireLoaders
            }
            return require
        }

        /**
         * @param {string} ext 
         * @param {any} loader 
         */
        function registerLoader(ext, loader) {
            requireLoaders[ext] = loader
            console.info('Register Require Loader ' + ext + ' => ' + (loader.name || '<anonymous>') + '.')
        }
        /**
         * @param {*} ext 
         */
        function getLoader(ext) {
            return requireLoaders[ext]
        }
        /**
         * @param {*} ext 
         */
        function unregisterLoader(ext) {
            delete requireLoaders[ext]
            console.info('unregister Require Loader ' + ext + '.')
        }

        function printRequireInfo() {
            console.info('Initialization require module.')
            console.info('ParentDir:', _canonical(parent))
            console.info('Require module env list:')
            console.info('- MS_NODE_PATH:', MS_NODE_PATH.startsWith(root) ? MS_NODE_PATH.split(root)[1] : MS_NODE_PATH)
            console.info('- MS_NODE_REGISTRY:', MS_NODE_REGISTRY)
            console.info('- FALLBACK_NODE_REGISTRY:', FALLBACK_NODE_REGISTRY)
        }

        function initCacheModuleIds() {
            try {
                cacheModuleIds = JSON.parse(base.read(cacheModuleIdsFile))
                if (cacheModuleIds['@ccms-cache-module-root'] != MS_NODE_PATH) {
                    throw new Error('canonicalRoot Change ' + cacheModuleIds['@ccms-cache-module-root'] + ' to ' + MS_NODE_PATH + ' Clear Cache!')
                }
                console.log('Read cacheModuleIds from file', cacheModuleIdsFile.startsWith(root) ? cacheModuleIdsFile.split(root)[1] : cacheModuleIdsFile)
            } catch (error) {
                cacheModuleIds = {}
                cacheModuleIds['@ccms-cache-module-root'] = MS_NODE_PATH
                console.log('Initialization new cacheModuleIds: ' + error)
            }
        }

        function initVersionLock() {
            try {
                var version_lock_url = 'https://ms.yumc.pw/api/plugin/download/name/version_lock' + (global.debug ? '-debug' : '')
                ModulesVersionLock = JSON.parse(fetchContent(version_lock_url, 5))
                try {
                    ModulesVersionLock = __assign(ModulesVersionLock, JSON.parse(base.read(localVersionLockFile)))
                } catch (e) {
                }
            } catch (error) {
                console.warn("无法获取到最新的版本锁定信息 使用默认配置.")
                console.warn("InitVersionLock Error:", error)
                console.debug(error)
                ModulesVersionLock = { "@babel/standalone": "7.12.18", "crypto-js": "3.3.0" }
            }
            console.info('Lock module version List:')
            for (var key in ModulesVersionLock) {
                console.info('- ' + key + ': ' + ModulesVersionLock[key])
            }
        }

        function initRequireLoader(require) {
            registerLoader('js', compileJsFile)
            registerLoader('json', compileJson)
            try {
                engineLoad({
                    script: fetchContent('https://ms.yumc.pw/api/plugin/download/name/require_loader', 5),
                    name: 'core/require_loader.js'
                })(require)
            } catch (error) {
                console.warn("无法获取到最新的加载器信息 使用默认配置.")
                console.warn("InitRequireLoader Error:", error)
                console.debug(error)
                registerLoader('ms', compileJsFile)
            }
            return require
        }

        if (typeof parent === 'string') {
            parent = new File(parent)
        }
        /**
         * @type {{[key:string]:(module:any, file:string, optional?:any)=>any}} requireLoader
         */
        var requireLoaders = {}
        /**
         * @type {{[key:string]:any}} cacheModules
         */
        var cacheModules = {}
        var cacheModuleIdsFile = _canonical(new File(MS_NODE_PATH, 'cacheModuleIds.json'))
        var localVersionLockFile = _canonical(new File(MS_NODE_PATH, 'moduleVersionLock.json'))
        /**
         * @type {{[key:string]:{[key:string]:string}|string}} cacheModuleIds
         */
        var cacheModuleIds = {}
        /**
         * @type {{[key:string]:boolean}} notFoundModules
         */
        var notFoundModules = {}
        var upgradeMode = false
        var executor = Executors.newSingleThreadExecutor(function (r) {
            return new Thread(r, "MiaoScript require thread")
        })

        printRequireInfo()
        initCacheModuleIds()
        initVersionLock()

        return initRequireLoader(getRequire(parent, ""))
    })
