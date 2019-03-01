'use strict';
/**
 * MiaoScript Chat处理类
 */
/*global Java, base, module, exports, require*/
function ChatHandlerDefault() {
    // noinspection JSUnusedGlobalSymbols
    this.tellraw = function(sender, raw) {
        this.json(sender, JSON.stringify(raw));
    }
}
exports = module.exports = Object.assign(new ChatHandlerDefault(), requireInternal('chat'));
