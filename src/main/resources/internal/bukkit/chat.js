/*global Java, base, module, exports, require*/
var bukkit = require('api/server');

var nmsChatSerializerClass;
var nmsIChatBaseComponentClass;
var packetTypeClass;
var nmsChatMessageTypeClass;

var chatMessageTypes;

var String = Java.type('java.lang.String');

function init () {
    nmsChatSerializerClass = bukkit.nmsCls(bukkit.nmsVersion.split("_")[1] > 7 ? "IChatBaseComponent$ChatSerializer" : "ChatSerializer");
    nmsIChatBaseComponentClass = bukkit.nmsCls('IChatBaseComponent');
    packetTypeClass = bukkit.nmsCls("PacketPlayOutChat");
    var packetTypeConstructor;
    Java.from(packetTypeClass.class.constructors).forEach(function (c) {
        if (c.parameterTypes.length == 2) { packetTypeConstructor = c };
    })
    nmsChatMessageTypeClass = packetTypeConstructor.parameterTypes[1];
    if (nmsChatMessageTypeClass.isEnum()) {
        chatMessageTypes = nmsChatMessageTypeClass.getEnumConstants();
    } else {
        switch (nmsChatMessageTypeClass.name) {
            case "int":
                nmsChatMessageTypeClass = java.lang.Integer;
            case "byte":
                nmsChatMessageTypeClass = java.lang.Byte;
        }
    }
}

function json(sender, json) {
    send(sender, json, 0);
}

function send(sender, json, type) {
    var serialized = nmsChatSerializerClass.a(json)
    var typeObj = chatMessageTypes == null ? nmsChatMessageTypeClass.valueOf(String.valueOf(type)) : chatMessageTypes[type];
    sendPacket(sender, new packetTypeClass(serialized, typeObj))
}

function sendPacket(player, p) {
    player.handle.playerConnection.sendPacket(p);
}

init();

exports = module.exports = {
    json: json
};