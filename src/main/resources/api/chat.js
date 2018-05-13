/*global Java, base, module, exports, require*/
function ChatHandlerDefault() {
    this.tellraw = function(sender, raw) {
        this.json(sender, JSON.stringify(raw));
    }
}
var ChatHandler = Object.assign(new ChatHandlerDefault(), requireInternal('chat'));

exports = module.exports = ChatHandler;