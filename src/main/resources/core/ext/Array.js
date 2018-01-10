/**
 * 补丁和方法扩展
 */
(function () {
    if (!Array.prototype.copyPartialMatches) {
        Object.defineProperty(Array.prototype, "copyPartialMatches", {
            enumerable: false,
            value: function (token, array) {
                this.forEach(function (e) {
                    if (e.startsWith(token)) {
                        array.push(e)
                    }
                })
                return array
            }
        });
    }
})();