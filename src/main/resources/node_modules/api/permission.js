'use strict';
/**
 * MiaoScript Permission处理类
 */
/*global Java, base, module, exports, require*/
function PermissionHandlerDefault() {
}
exports = module.exports = Object.assign(new PermissionHandlerDefault(), requireInternal('permission', true));
