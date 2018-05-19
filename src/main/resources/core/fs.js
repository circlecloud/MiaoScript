'use strict';

/*global Java, base, module, exports, require, __FILE__*/
var File = Java.type("java.io.File");
var Files = Java.type("java.nio.file.Files");
// noinspection JSUnresolvedVariable
var separatorChar = File.separatorChar;
var StandardCopyOption = Java.type("java.nio.file.StandardCopyOption");
// noinspection JSUnusedLocalSymbols
var _toString = function (obj) {
    return Object.prototype.toString.call(obj);
};

/**
 * 用文件分割符合并路径
 */
function concat() {
    return Array.prototype.join.call(arguments, separatorChar);
}

/**
 * 获得文件
 * @constructor(file)
 * @constructor(dir,file)
 * @returns {*}
 */
function file() {
    if (!arguments[0]) {
        console.warn("文件名称不得为 undefined 或者 null !");
    }
    switch (arguments.length) {
        case 1:
            var f = arguments[0];
            if (f instanceof File) {
                return f;
            }
            if (typeof f === "string") {
                return new File(f);
            }
            if (f instanceof java.nio.file.Path) {
                return f.toFile();
            }
            break;
        default:
            return new File(file(arguments[0]), arguments[1]);
    }
}

/**
 * 创建目录
 * @param path
 */
function mkdirs(path) {
    // noinspection JSUnresolvedVariable
    fs.file(path).parentFile.mkdirs();
}

/**
 * 创建文件
 * @param file
 */
function create(file) {
    var f = fs.file(path);
    if (!f.exists()) {
        mkdirs(f);
        f.createNewFile();
    }
}

/**
 * 获得文件规范路径
 * @param file
 * @returns {*}
 */
function path(file) {
    // noinspection JSUnresolvedVariable
    return fs.file(file).canonicalPath;
}

/**
 * 复制文件
 * @param inputStream 输入流
 * @param target 目标文件
 * @param override 是否覆盖
 */
function copy(inputStream, target, override) {
    Files.copy(inputStream, target.toPath(), StandardCopyOption[override ? 'REPLACE_EXISTING' : 'ATOMIC_MOVE']);
}

/**
 * 读取文件
 * @param path 文件路径
 */
function read(path) {
    var file = fs.file(path);
    if (!file.exists()) {
        console.warn('读取文件', file, '错误 文件不存在!');
        return;
    }
    // noinspection JSPrimitiveTypeWrapperUsage
    return new java.lang.String(Files.readAllBytes(file.toPath()), "UTF-8");
}

/**
 * 保存内容文件
 * @param path 路径
 * @param content 内容
 * @param override 是否覆盖
 */
function save(path, content, override) {
    var file = fs.file(path);
    file.getParentFile().mkdirs();
    Files.write(file.toPath(), new java.lang.String(content).getBytes("UTF-8"));
}

/**
 * 列出目录文件
 * @param path
 */
function list(path) {
    var dir = file(path);
    // noinspection JSValidateTypes
    if (dir.isDirectory()) {
        return Files.list(dir.toPath());
    }
    console.debug('路径', path, '不是一个目录 返回空数组!');
    return [];
}

/**
 * 移动文件
 * @param src 原始目录
 * @param des 目标目录
 * @param override 是否覆盖
 */
function move(src, des, override) {
    Files.move(fs.file(src).toPath(), fs.file(des).toPath(),
        override ? StandardCopyOption['REPLACE_EXISTING'] : StandardCopyOption['ATOMIC_MOVE'])
}

function del(file) {
    file = fs.file(file);
    if (!file.exists()) {
        return;
    }
    // noinspection JSValidateTypes
    if (file.isDirectory()) {
        // noinspection JSUnresolvedVariable
        Files.list(file.toPath()).collect(java.util.stream.Collector.toList()).forEach(function (f) {
            del(f);
        })
    }
    Files.delete(file.toPath());
}

// noinspection JSUnusedLocalSymbols
function exists(file) {
    return fs.file(file).exists()
}

var fs = {};

fs.path = fs.canonical = fs.realpath = path;
fs.write = fs.save = save;
fs.readdir = fs.list = list;
fs.rename = fs.move = move;
fs.delete = fs.del = del;

// noinspection JSUnusedGlobalSymbols
Object.assign(fs, {
    concat: concat,
    create: create,
    mkdirs: mkdirs,
    file: file,
    copy: copy,
    read: read
});

exports = module.exports = fs;