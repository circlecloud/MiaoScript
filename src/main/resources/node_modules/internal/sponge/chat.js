/*global Java, base, module, exports, require*/
var TextSerializers = Java.type('org.spongepowered.api.text.serializer.TextSerializers');
function json(sender, json) {
    sender.sendMessage(TextSerializers.JSON.deserialize(json));
}

exports = module.exports = {
    json: json
};