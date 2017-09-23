'use strict';

/*global Java, base, module, exports, require, __FILE__*/
var String = Java.type("java.lang.String");
var File = Java.type("java.io.File");
var Files = Java.type("java.nio.file.Files");
var StandardCopyOption = Java.type("java.nio.file.StandardCopyOption");

/**
 * 获得文件
 * @constructor(file)
 * @constructor(dir,file)
 * @returns {*}
 */
exports.file = function () {
    if (!arguments[0]) {
        log.w("文件名称不得为 undefined 或者 null !");
    }
    if (exports.canonical(arguments[0])) {
        return arguments[0];
    }
    switch (arguments.length) {
        case 1:
            return new File(arguments[0]);
        case 2:
            return new File(exports.file(arguments[0]), arguments[1]);
    }
};
/**
 * 创建目录
 * @param file
 */
exports.mkdirs = function (file) {
    // noinspection JSUnresolvedVariable
    file.parentFile.mkdirs();
};
/**
 * 创建文件
 * @param file
 */
exports.create = function (file) {
    file = exports.file(file);
    if (!file.exists()) {
        exports.mkdirs(file);
        file.createNewFile();
    }
};
/**
 * 获得文件规范路径
 * @param file
 * @returns {*}
 */
exports.canonical = function (file) {
    // noinspection JSUnresolvedVariable
    return file.canonicalPath;
};
/**
 * 复制文件
 * @param inputStream 输入流
 * @param target 目标文件
 * @param override 是否覆盖
 */
exports.copy = function (inputStream, target, override) {
    Files.copy(inputStream, target.toPath(), StandardCopyOption[override ? 'REPLACE_EXISTING' : 'ATOMIC_MOVE']);
};
/**
 * 读取文件
 * @param file 文件路径
 */
exports.read = function (file) {
    file = exports.file(file);
    if (!file.exists()) {
        log.w("读取文件 %s 错误 文件不存在!", file);
        return;
    }
    // noinspection JSPrimitiveTypeWrapperUsage
    return new String(Files.readAllBytes(file.toPath()), "UTF-8");
};
/**
 * 保存内容文件
 * @param path 路径
 * @param content 内容
 * @param override 是否覆盖
 */
exports.save = function (path, content, override) {
    Files.write(new File(path).toPath(), content.getBytes("UTF-8"), StandardCopyOption[override ? 'REPLACE_EXISTING' : 'ATOMIC_MOVE']);
};
/**
 * 列出目录文件
 * @param path
 */
exports.list = function (path) {
    var dir = exports.file(path);
    if (dir.isDirectory()) {
        return Files.list(dir.toPath());
    }
    log.w("路径 %s 不是一个目录 返回空数组!");
    return [];
};