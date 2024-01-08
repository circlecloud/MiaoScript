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
     * @param {string} root
     */
    function (root) {
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
        var MS_FALLBACK_NODE_REGISTRY = System.getenv("MS_FALLBACK_NODE_REGISTRY") || 'https://repo.yumc.pw/repository/npm'
        var MS_SCRIPT_PACKAGE_CENTER = System.getenv("MS_SCRIPT_PACKAGE_CENTER") || 'https://mscript.yumc.pw/api/plugin/download'
        var MS_NETWORK_CONNECT_TIMEOUT = System.getenv("MS_NETWORK_CONNECT_TIMEOUT") || 5000
        var MS_NETWORK_READ_TIMEOUT = System.getenv("MS_NETWORK_TIMEOUT") || 45000
        var MS_NETWORK_DOWNLOAD_TIMEOUT = System.getenv("MS_NETWORK_DOWNLOAD_TIMEOUT") || 60000
        var MS_NETWORK_USE_CACHES = System.getenv("MS_NETWORK_USE_CACHES") || true

        var CoreModules = [
            "assert", "async_hooks", "Buffer", "child_process", "cluster", "crypto",
            "dgram", "dns", "domain", "events", "fs", "http", "http2", "https",
            "inspector", "net", "os", "path", "perf_hooks", "process", "punycode",
            "querystring", "readline", "repl", "stream", "string_decoder",
            "timer", "tls", "trace_events", "tty", "url", "util",
            "v8", "vm", "wasi", "worker_threads", "zlib"
        ]

        var VersionLockModules = {}

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

        function __error(message, name) {
            var error = new Error(message)
            if (name) { error.name = name }
            console.error(message)
            return error
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
                // 解析 root 模块目录
                var rootModule = resolveAsFile(name, MS_NODE_PATH) || resolveAsDirectory(name, MS_NODE_PATH)
                if (rootModule) { return rootModule }
                // 解析Node目录
                var dir = [parent, 'node_modules'].join(separatorChar)
                return resolveAsFile(name, dir) || resolveAsDirectory(name, dir) ||
                    (parent && parent.toString().startsWith(root) ?
                        resolve(name, new File(parent).getParent(), optional) : undefined)
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
            // 只解析带后缀的文件 其他文件视为非法文件
            if (file.isFile() && file.name.lastIndexOf('.') != -1) {
                return file
            }
            // JS文件
            var js = new File(normalizeName(_canonical(file), '.js'))
            if (js.isFile()) {
                return js
            }
            // JSON文件
            var json = new File(normalizeName(_canonical(file), '.json'))
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
                try {
                    var json = JSON.parse(base.read(_package))
                    if (json.main) {
                        return resolveAsFile(json.main, dir) || resolveAsFile('index.js', new File(dir, json.main))
                    }
                } catch (error) {
                    throw __error('resolveAsDirectory ' + dir + ' package.json error ' + error)
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
                throw __error("can't require file " + file + '. error: module must include file ext.')
            }
            var name = filename.substring(0, lastDotIndexOf)
            var ext = filename.substring(lastDotIndexOf + 1)
            var loader = requireLoaders[ext]
            if (!loader) {
                throw __error('Unsupported module ' + filename + '. require loader not found.')
            }
            /**
             * @type any
             */
            var module = {
                id: id,
                name: name,
                ext: ext,
                parent: optional.parent,
                exports: {},
                loaded: false,
                loader: loader,
                path: _canonical(file.parentFile),
                filename: _canonical(file),
                children: []
            }
            module.require = getRequire(module)
            if (module.parent && module.parent.children && module.parent.children.indexOf(module) == -1) {
                module.parent.children.push(module)
            }
            console.trace('Loading module', name + '(' + id + ')', 'Optional', JSON.stringify(__assign(optional, { parent: undefined })))
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
                module, module.exports, module.require, module.path, module.filename
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
         * 获得网络链接
         * @param {string} url 网址
         */
        function getConnection(url) {
            var connection = new URL(url).openConnection()
            connection.setConnectTimeout(MS_NETWORK_CONNECT_TIMEOUT)
            connection.setReadTimeout(MS_NETWORK_READ_TIMEOUT)
            connection.setUseCaches(MS_NETWORK_USE_CACHES)
            return connection
        }

        /**
         * 获得网络流
         * @param {string} url 网址
         */
        function getConnectionStream(url) {
            var connection = getConnection(url)
            return connection.getInputStream()
        }

        function splitVersionFromName(name) {
            // process package name
            // es6-map/implement => [es6-map/implement, undefined]
            // @ccms/common/dist/reflect => [@ccms/common, undefined]
            var name_arr = name.split('/')
            var module_name = ''
            var module_version = ''
            if (name.startsWith('@')) {
                var module_version_arr = name_arr[1].split('@')
                module_name = name_arr[0] + '/' + module_version_arr[0]
            } else {
                var module_version_arr = name_arr[0].split('@')
                module_name = module_version_arr[0]
            }
            // handle internal package version
            if (name.startsWith(global.scope) && global.ScriptEngineChannel) {
                module_version = global.ScriptEngineChannel
            } else {
                module_version = module_version_arr[1]
            }
            return [module_name, module_version]
        }

        /**
         * 尝试从网络下载依赖包
         * @param {string} name 包名称
         * @param {string} optional 附加选项
         * @param {number} retry 重试次数
         */
        function download(name, optional, retry) {
            var name_arr = splitVersionFromName(name)
            var module_name = name_arr[0]
            var module_version = name_arr[1]
            try {
                var target = MS_NODE_PATH + separatorChar + module_name
                if (new File(target, 'package.json').exists()) { return name }
                var info = fetchPackageInfo(module_name)
                if (!module_version) {
                    // if not special version get from lock or tag
                    module_version = VersionLockModules[module_name]
                } else if (!/\d+\.\d+\.\w+/.test(module_version)) {
                    // maybe module_version = latest if special version not exist then fallback latest
                    console.log('try get node_module ' + module_name + ' version from ' + module_version + ' tag waiting...')
                    module_version = info['dist-tags'][module_version]
                }
                if (!module_version) {
                    console.log('try get node_module ' + module_name + ' version from latest tag waiting...')
                    module_version = info['dist-tags']['latest']
                }
                if (!module_version) { throw __error('fetch node_module ' + module_name + " failed. can't found version from " + name + ".", 'ModuleNotFoundError') }
                var _version = info.versions[module_version]
                if (!_version) { throw __error('fetch node_module ' + module_name + ' version ' + module_version + " failed. can't found tarball from versions.", 'ModuleNotFoundError') }
                var url = _version.dist.tarball
                console.log('fetch node_module ' + module_name + ' version ' + module_version + ' waiting...')
                return executor.submit(new Callable(function () {
                    var tis = new TarInputStream(new BufferedInputStream(new GZIPInputStream(getConnectionStream(url))))
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
                })).get(MS_NETWORK_DOWNLOAD_TIMEOUT, TimeUnit.MILLISECONDS)
            } catch (error) {
                if (error.name == 'ModuleNotFoundError') { throw error }
                if (retry > 3) { throw __error('fetch node_module ' + module_name + ' version ' + module_version + ' failed. greater than 3 times stop retry.') }
                console.log('fetch node_module ' + module_name + ' version ' + module_version + ' failed retrying...')
                return download(name, optional, ++retry)
            }
        }

        /**
         * 获取包信息
         * @param {string} module_name
         */
        function fetchPackageInfo(module_name) {
            var content = ''
            try {
                content = fetchContent(MS_NODE_REGISTRY + '/' + module_name)
            } catch (ex) {
                console.warn("can't fetch package " + module_name + ' from ' + MS_NODE_REGISTRY + ' registry. try fetch from ' + MS_FALLBACK_NODE_REGISTRY + ' registry...')
                content = fetchContent(MS_FALLBACK_NODE_REGISTRY + '/' + module_name)
            }
            return JSON.parse(content)
        }

        /**
         * 获取网络内容
         * @param {string} url 网址
         * @param {number} [timeout] 超时时间
         */
        function fetchContent(url, timeout) {
            return executor.submit(new Callable(function fetchContent() {
                var input = getConnectionStream(url)
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
            })).get(timeout || MS_NETWORK_READ_TIMEOUT, TimeUnit.MILLISECONDS)
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
                throw __error("can't load nodejs core module " + name + " . maybe later will auto replace to " + global.scope + "/nodejs/" + name + ' to compatible...')
            }
            return name
        }

        /**
         * 检查缓存模块
         */
        function checkCacheModule(optional) {
            return optional.local ? cacheModuleIds[optional.parent.id] && cacheModuleIds[optional.parent.id][optional.path] : cacheModuleIds[optional.path]
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
            if (_isFile(file) && file.name.lastIndexOf('.') != -1) {
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
            var file = resolve(name, path, optional)
            // search module
            if (file === undefined) {
                // excloud local dir, prevent too many recursive call and cache not found module
                if (optional.local || optional.recursive || notFoundModules[name]) {
                    delete optional.parent
                    throw __error("can't found module " + name + '(' + JSON.stringify(optional) + ') at local ' + path + ' or network!')
                }
                optional.recursive = true
                return _require(download(name, optional, 1), path, optional)
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
                var parent = cacheModuleIds[optional.parent.id]
                if (!parent) {
                    cacheModuleIds[optional.parent.id] = {}
                }
                return cacheModuleIds[optional.parent.id][optional.path] = _canonical(file)
            }
            return cacheModuleIds[optional.path] = _canonical(file)
        }

        function _requireFile(file, optional) {
            // 重定向文件名称和类型
            return getCacheModule(_canonical(file), file, optional)
        }

        /**
         * 闭包方法
         * @param {any} parent 父模块
         * @returns {Function}
         */
        function exports(parent) {
            /**
             * @param {string} path
             * @param {any} optional
             */
            var require = function __DynamicRequire__(path, optional) {
                if (!path) {
                    throw __error("require path can't be undefined or empty!")
                }
                var optional = __assign({
                    cache: true,
                    parent: parent,
                    path: path,
                    local: path.startsWith('.') || path.startsWith('/')
                }, optional)
                return _require(path, parent.path, optional).exports
            }
            require.resolve = function __DynamicResolve__(path, optional) {
                return _canonical(new File(resolve(path, root, __assign({
                    parent: parent,
                    cache: true,
                    local: path.startsWith('.') || path.startsWith('/')
                }, optional))))
            }
            return require
        }

        /**
         * @param {string} name
         */
        function __DynamicClear__(name) {
            for (var cacheModule in cacheModules) {
                if (cacheModule.indexOf(name) !== -1) {
                    console.trace('clear module ' + cacheModule + ' ...')
                    delete cacheModules[cacheModule]
                }
            }
        }

        function __DynamicDisable__() {
            base.save(cacheModuleIdsFile, JSON.stringify(upgradeMode ? {} : cacheModuleIds))
            for (var cacheModule in cacheModules) {
                delete cacheModules[cacheModule]
            }
            cacheModules = {}
            for (var cacheModuleId in cacheModuleIds) {
                delete cacheModuleIds[cacheModuleId]
            }
            cacheModuleIds = {}
            notFoundModules = {}
        }

        function __setUpgradeMode__(status) {
            upgradeMode = status
        }

        /**
         * @param {any} parent
         */
        function getRequire(parent) {
            /**
             * @type {any} require
             */
            var require = exports(parent)
            require.main = mainRequire
            require.cache = cacheModules
            require.clear = __DynamicClear__
            require.disable = __DynamicDisable__
            require.setUpgradeMode = __setUpgradeMode__
            require.loader = {
                register: registerLoader,
                get: getLoader,
                unregister: unregisterLoader,
            }
            require.loaders = requireLoaders
            require.internal = {
                coreModules: CoreModules,
                cacheModules: cacheModules,
                cacheModuleIds: cacheModuleIds,
                notFoundModules: notFoundModules,
                versionLockModules: VersionLockModules
            }
            require.loadCoreScript = loadCoreScript
            return require
        }

        /**
         * @param {string} ext 
         * @param {any} loader 
         */
        function registerLoader(ext, loader) {
            if (requireLoaders[ext]) {
                return console.error('require loader ' + ext + ' already register ignore. if you want override loader please unregister before register.')
            }
            requireExts.push(ext)
            requireLoaders[ext] = loader
            console.info('register require loader ' + ext + ' => ' + (loader.name || '<anonymous>') + '.')
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
            requireExts.splice(requireExts.indexOf(ext), 1);
            delete requireLoaders[ext]
            console.info('unregister require loader ' + ext + '.')
        }

        function printRequireInfo() {
            console.info('Initialization require module.')
            console.info('ParentDir:', root)
            console.info('Require module env list:')
            console.info('- JAVA_VERSION:', System.getProperty("java.version"))
            console.info('- PLUGIN_VERSION:', base.version)
            console.info('- MS_NODE_PATH:', MS_NODE_PATH.startsWith(root) ? MS_NODE_PATH.split(root)[1] : MS_NODE_PATH)
            console.info('- MS_NODE_REGISTRY:', MS_NODE_REGISTRY)
            console.info('- MS_FALLBACK_NODE_REGISTRY:', MS_FALLBACK_NODE_REGISTRY)
        }

        function initCacheModuleIds() {
            try {
                cacheModuleIds = JSON.parse(base.read(cacheModuleIdsFile))
                if (cacheModuleIds['@ccms-cache-module-root'] != MS_NODE_PATH) {
                    throw __error('canonicalRoot Change ' + cacheModuleIds['@ccms-cache-module-root'] + ' to ' + MS_NODE_PATH + ' Clear Cache!')
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
                var version_lock_url = MS_SCRIPT_PACKAGE_CENTER + '?name=version_lock' + (global.debug ? '-debug' : '')
                VersionLockModules = JSON.parse(fetchContent(version_lock_url, 5000))
                try {
                    VersionLockModules = __assign(VersionLockModules, JSON.parse(base.read(localVersionLockFile)))
                } catch (e) {
                }
            } catch (error) {
                console.warn("无法获取到最新的版本锁定信息 使用默认配置.")
                console.warn("InitVersionLock Error:", error)
                console.debug(error)
                VersionLockModules = {
                    "@babel/standalone": "7.12.18",
                    "crypto-js": "3.3.0",
                    "core-js": "3.33.1"
                }
            }
            console.info('Lock module version List:')
            for (var key in VersionLockModules) {
                console.info('- ' + key + ': ' + VersionLockModules[key])
            }
        }

        function initRequireLoader(require) {
            registerLoader('js', compileJsFile)
            registerLoader('json', compileJson)
            try {
                loadCoreScript('require_loader')(require)
            } catch (error) {
                console.warn("无法获取到最新的加载器信息 使用默认配置.")
                console.warn("InitRequireLoader Error:", error)
                console.debug(error)
                registerLoader('ms', compileJsFile)
            }
            require.main = mainRequire = require
            return require
        }

        function loadCoreScript(name) {
            return engineLoad({
                script: fetchContent(MS_SCRIPT_PACKAGE_CENTER + '?name=' + name, 5000),
                name: 'core/' + name + '.js'
            })
        }

        if (typeof parent === 'string') {
            parent = new File(parent)
        }
        var mainRequire = undefined
        /**
         * require 支持的后缀
         * @type {string[]} requireExts
         */
        var requireExts = []
        /**
         * require加载器
         * @type {{[key:string]:(module:any, file:string, optional?:any)=>any}} requireLoader
         */
        var requireLoaders = {}
        /**
         * 已缓存的模块
         * @type {{[key:string]:any}} [cacheModules]
         */
        var cacheModules = {}
        var cacheModuleIdsFile = _canonical(new File(MS_NODE_PATH, 'cacheModuleIds.json'))
        var localVersionLockFile = _canonical(new File(MS_NODE_PATH, 'moduleVersionLock.json'))
        /**
         * 已缓存的模块ID
         * @type {{[key:string]:{[key:string]:string}|string}} [cacheModuleIds]
         */
        var cacheModuleIds = {}
        /**
         * 未找到的模块
         * @type {{[key:string]:boolean}}
         */
        var notFoundModules = {}
        var upgradeMode = false
        var executor = Executors.newSingleThreadExecutor(function (r) {
            return new Thread(r, "MiaoScript require thread")
        })

        printRequireInfo()
        initCacheModuleIds()
        initVersionLock()

        return initRequireLoader(getRequire({
            id: 'main',
            path: root
        }))
    })
