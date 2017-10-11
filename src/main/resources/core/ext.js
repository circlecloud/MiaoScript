/*global Java, base, module, exports, require, __FILE__*/
/**
 * 菜单基础扩展脚本
 * Created by 蒋天蓓 on 2017/2/8 0008.
 */
var ext = {};
/**
 * 获得静态类
 * @param name 类名
 * @returns {*}
 */
ext.getStatic = function (name) {
    return base.getClass(name).static;
};
/**
 * 获得随机数
 * @param max 最大值
 * @param min 最小值
 */
ext.random = function (max, min) {
    min = min === undefined ? 0 : min;
    return Math.floor(Math.random() * (max - min) + min);
};
/**
 * 判断对象是否为Null
 * @param obj 对象
 * @returns {boolean} notNull返回True
 */
ext.notNull = function (obj) {
    return obj !== undefined && obj !== null;
};
/**
 * 判断对象是否为Null
 * @param obj 对象
 * @returns {boolean} Null返回True
 */
ext.isNull = function (obj) {
    return obj === undefined || obj === null;
};