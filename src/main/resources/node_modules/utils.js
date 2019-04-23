'use strict';
/**
 * 常用工具类
 * Created by 蒋天蓓 on 2018/5/12 0009.
 */
/*global Java, base, module, exports, require, __FILE__*/
var Arrays = Java.type('java.util.Arrays');

function toStr(obj) {
    if (obj.class) {
        return Arrays.toString()
    }
}

function compare(prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
}

exports = module.exports = {
    compare: compare
};