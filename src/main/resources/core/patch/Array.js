/**
 * 补丁和方法扩展
 */
(function () {
    // noinspection JSUnresolvedVariable
    if (!Array.prototype.copyPartialMatches) {
        Object.defineProperty(Array.prototype, "copyPartialMatches", {
            enumerable: false,
            value: function (token, array) {
                this.forEach(function (e) {
                    if (e.toLowerCase().startsWith(token.toLowerCase())) {
                        array.push(e)
                    }
                });
                return array
            }
        });
    }
})();