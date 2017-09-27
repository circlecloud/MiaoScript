'use strict';

/*global Java, base, module, exports, require, __FILE__*/

var File = Java.type("java.io.File");
var ZipFile = Java.type("java.util.zip.ZipFile");
var fs = require('fs');

/**
 * 获取文件真实名称
 *
 * @param name
 *            名称
 * @return string 文件名称
 */
function getRealName(name) {
    return new File(name).name;
}

/**
 * 解压文件
 * @param zipFile 压缩文件
 * @param target 目标目录(不传则为zip文件同级目录)
 */
function unzip(zipFile, target) {
    if (!zipFile.exists()) {
        log.w("解压文件 %s 错误 文件不存在!", zipFile);
        return;
    }
    if (target === undefined) {
        // noinspection JSUnresolvedVariable
        target = new File(zipFile.parentFile.canonicalPath, zipFile.name.split(".")[0]);
    }
    log.d("解压文件 %s => %s", zipFile.canonicalPath, target);
    var zipObj = new ZipFile(zipFile);
    var e = zipObj.entries();
    while (e.hasMoreElements()) {
        var entry = e.nextElement();
        if (entry.isDirectory()) {
            continue;
        }
        var destinationFilePath = new File(target, getRealName(entry.name));
        destinationFilePath.getParentFile().mkdirs();
        fs.copy(zipObj.getInputStream(entry), destinationFilePath, true);
    }
    zipObj.close();
}

exports.unzip = unzip;