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
// @ts-check
(
    /**
     * @param {string} parent
     */
    function (parent) {
        'use strict'
        // @ts-ignore
        var File = Java.type('java.io.File')
        // @ts-ignore
        var Paths = Java.type('java.nio.file.Paths')
        // @ts-ignore
        var Files = Java.type('java.nio.file.Files')
        // @ts-ignore
        var StandardCopyOption = Java.type('java.nio.file.StandardCopyOption')

        // @ts-ignore
        var TarInputStream = Java.type('org.kamranzafar.jtar.TarInputStream')
        // @ts-ignore
        var GZIPInputStream = Java.type('java.util.zip.GZIPInputStream')
        // @ts-ignore
        var BufferedInputStream = Java.type('java.io.BufferedInputStream')

        // @ts-ignore
        var URL = Java.type('java.net.URL')
        // @ts-ignore
        var ByteArrayOutputStream = Java.type("java.io.ByteArrayOutputStream")
        // @ts-ignore
        var ByteArray = Java.type("byte[]")
        // @ts-ignore
        var Thread = Java.type('java.lang.Thread')
        // @ts-ignore
        var Callable = Java.type('java.util.concurrent.Callable')
        // @ts-ignore
        var Executors = Java.type('java.util.concurrent.Executors')
        var separatorChar = File.separatorChar

        // @ts-ignore
        var NODE_PATH = java.lang.System.getenv("NODE_PATH") || root + separatorChar + 'node_modules'
        // @ts-ignore
        var NODE_REGISTRY = java.lang.System.getenv("NODE_REGISTRY") || 'https://registry.npm.taobao.org'
        // @ts-ignore
        var MS_NODE_REGISTRY = java.lang.System.getenv("MS_NODE_REGISTRY") || 'https://repo.yumc.pw/repository/npm'

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
                    // @ts-ignore
                    (parent && parent.toString().startsWith(root) ?
                        resolve(name, new File(parent).getParent(), optional) : resolveAsDirectory(name, NODE_PATH) || undefined)
            }
        }

        /**
         * 解析文件
         * @param {string} file 文件
         * @param {string | undefined} dir 目录
         * @returns {*}
         */
        function resolveAsFile(file, dir) {
            file = dir !== undefined ? new File(dir, file) : new File(file)
            // 直接文件
            // @ts-ignore
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
                // @ts-ignore
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
         * @param {string} name 模块名称
         * @param {any} file 模块文件
         * @param {any} optional 附加选项
         * @returns {Object}
         */
        function getCacheModule(id, name, file, optional) {
            var module = cacheModules[id]
            if (optional.cache && module) {
                return module
            }
            return createModule(id, name, file, optional)
        }

        /**
         * 编译模块
         * @param {string} id 模块ID
         * @param {string} name 模块名称
         * @param {any} file 模块文件
         * @param {any} optional 附加选项
         * @returns {Object}
         */
        function createModule(id, name, file, optional) {
            console.trace('Loading module', name + '(' + id + ')', 'Optional', JSON.stringify(optional))
            var module = {
                id: id,
                exports: {},
                loaded: false,
                require: getRequire(file.parentFile, id)
            }
            cacheModules[id] = module
            var cfile = _canonical(file)
            if (cfile.endsWith('.js')) {
                compileJs(module, file, __assign(optional, { id: id }))
            } else if (cfile.endsWith('.json')) {
                compileJson(module, file)
            } else if (cfile.endsWith('.msm')) {
                throw Error('Unsupported MiaoScript module!')
            } else {
                throw Error('Unknown file type ' + cfile)
            }
            return module
        }

        /**
         * 预编译JS
         * @param {any} module JS模块
         * @param {any} file JS文件
         * @param {any} optional 附加选项
         * @returns {void}
         */
        function compileJs(module, file, optional) {
            // @ts-ignore
            var origin = base.read(file)
            if (optional.hook) {
                origin = optional.hook(origin)
            }
            // 2019-09-19 使用 扩展函数直接 load 无需保存/删除文件
            // 2020-02-16 结尾新增换行 防止有注释导致加载失败
            // @ts-ignore
            var compiledWrapper = engineLoad({
                script: '(function $(module, exports, require, __dirname, __filename) {' + origin + '\n});',
                name: optional.id
            })
            compiledWrapper.apply(module.exports, [
                module, module.exports, module.require, file.parentFile, file
            ])
            module.loaded = true
        }

        /**
         * 预编译Json
         * @param {{ id?: string | null; exports?: {}; loaded: any; require?: any; }} module Json模块
         * @param {any} file Json 文件
         * @returns {void}
         */
        function compileJson(module, file) {
            // @ts-ignore
            module.exports = JSON.parse(base.read(file))
            module.loaded = true
        }

        /**
         * 尝试从网络下载依赖包
         * @param {string} name 包名称
         */
        function download(name) {
            // handle name es6-map/implement => es6-map @ccms/common/dist/reflect => @ccms/common
            var name_arr = name.split('/')
            var module_name = name.startsWith('@') ? name_arr[0] + '/' + name_arr[1] : name_arr[0]
            // @ts-ignore
            var target = NODE_PATH + separatorChar + module_name
            var _package = new File(target, 'package.json')
            if (_package.exists()) {
                return
            }
            // at windows need replace file name java.lang.IllegalArgumentException: Invalid prefix or suffix
            var info = fetchPackageInfo(module_name)
            var url = info.versions[ModulesVersionLock[module_name] || info['dist-tags']['latest']].dist.tarball
            console.log('fetch node_module ' + module_name + ' from ' + url + ' waiting...')
            return executor.submit(new Callable(function () {
                var tis = new TarInputStream(new BufferedInputStream(new GZIPInputStream(new URL(url).openStream())))
                // @ts-ignore
                var entry
                while ((entry = tis.getNextEntry()) != null) {
                    var targetPath = Paths.get(target + separatorChar + entry.getName().substring(8))
                    targetPath.toFile().getParentFile().mkdirs()
                    Files.copy(tis, targetPath, StandardCopyOption.REPLACE_EXISTING)
                }
                return name
            })).get()
        }

        /**
         * @param {string} module_name
         */
        function fetchPackageInfo(module_name) {
            var content = ''
            try {
                content = fetchContent(NODE_REGISTRY + '/' + module_name)
            } catch (ex) {
                console.debug('can\'t fetch package ' + module_name + ' from ' + NODE_REGISTRY + ' registry. try fetch from ' + MS_NODE_REGISTRY + ' registry...')
                content = fetchContent(MS_NODE_REGISTRY + '/' + module_name)
            }
            return JSON.parse(content)
        }

        function fetchContent(url) {
            return executor.submit(new Callable(function () {
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
                    output.close()
                }
            })).get()
        }

        var lastModule = ''

        /**
         * 检查核心模块
         * @param {string} name
         * @param {string} path
         */
        function checkCoreModule(name, path, optional) {
            if (name.startsWith('@ms') && lastModule.endsWith('.js')) {
                // @ts-ignore
                console.warn(lastModule + ' load deprecated module ' + name + ' auto replace to ' + (name = name.replace('@ms', global.scope)) + '...')
                return name
            } else {
                lastModule = name
            }
            if (CoreModules.indexOf(name) !== -1) {
                // @ts-ignore
                var newName = global.scope + '/nodejs/dist/' + name
                if (resolve(newName, path, optional) !== undefined) {
                    return newName
                }
                // @ts-ignore
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
            // search module
            name = checkCoreModule(name, path, optional)
            if ((file = resolve(name, path, optional)) === undefined) {
                // excloud local dir, prevent too many recursive call and cache not found module
                if (optional.local || optional.recursive || notFoundModules[name]) {
                    throw new Error("Can't found module " + name + '(' + JSON.stringify(optional) + ') at local ' + path + ' or network!')
                }
                try {
                    optional.recursive = true
                    return _require(download(name), path, optional)
                } catch (ex) {
                    notFoundModules[name] = true
                    throw new Error("Can't found module " + name + ' in directory ' + path + ' ERROR: ' + ex)
                }
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
            return getCacheModule(_canonical(file), file.name.split('.')[0], file, optional)
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
            // @ts-ignore
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
            require.internal = {
                coreModules: CoreModules,
                cacheModules: cacheModules,
                cacheModuleIds: cacheModuleIds,
                notFoundModules: notFoundModules,
            }
            return require
        }

        if (typeof parent === 'string') {
            parent = new File(parent)
        }
        /**
         * @type {{[key:string]:any}} cacheModules
         */
        var cacheModules = {}
        var cacheModuleIdsFile = _canonical(new File(NODE_PATH, 'cacheModuleIds.json'))
        var localVersionLockFile = _canonical(new File(NODE_PATH, 'moduleVersionLock.json'))
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
        console.info('Initialization require module. ParentDir:', _canonical(parent))
        console.info('Require module env list:')
        console.info('- NODE_PATH:', NODE_PATH)
        console.info('- NODE_REGISTRY:', NODE_REGISTRY)
        console.info('- MS_NODE_REGISTRY:', MS_NODE_REGISTRY)
        try {
            // @ts-ignore
            cacheModuleIds = JSON.parse(base.read(cacheModuleIdsFile))
            if (cacheModuleIds['@ccms-cache-module-root'] != NODE_PATH) {
                throw new Error('canonicalRoot Change ' + cacheModuleIds['@ccms-cache-module-root'] + ' to ' + NODE_PATH + ' Clear Cache!')
            }
            console.log('Read cacheModuleIds from file ' + cacheModuleIdsFile)
        } catch (error) {
            cacheModuleIds = {}
            cacheModuleIds['@ccms-cache-module-root'] = NODE_PATH
            console.log('Initialization new cacheModuleIds: ' + error)
        }
        try {
            ModulesVersionLock = JSON.parse(fetchContent('http://ms.yumc.pw/api/plugin/download/name/version_lock'))
            try {
                // @ts-ignore
                ModulesVersionLock = __assign(ModulesVersionLock, JSON.parse(base.read(localVersionLockFile)))
            } catch (e) {
            }
            console.info('Lock module version List:')
            for (var key in ModulesVersionLock) {
                console.info('- ' + key + ': ' + ModulesVersionLock[key])
            }
        } catch (error) {
            console.debug(error)
            ModulesVersionLock = {}
        }
        return getRequire(parent, "")
    })
