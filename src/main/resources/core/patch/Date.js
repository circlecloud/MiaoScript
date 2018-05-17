/**
 * 补丁和方法扩展
 */

(function () {
    /**
     * 日期格式化
     * 例: new Date().format('yyyy-MM-dd hh:mm:ss.s') => "2017-08-24 16:15:40.693"
     * @param fmt 格式化字符串
     * @returns {*}
     */
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? o[k] : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };
})();
