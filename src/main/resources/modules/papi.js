'use strict';
/**
 * PAPI扩展类
 */
/*global Java, base, module, exports, require, __FILE__*/
var PlaceholderAPI;
var server = require('api/server');

PlaceholderAPI = {
    setPlaceholders: function () {
        return arguments[1].replace(/&([1-9a-fA-F])/, '§$1');
    }
};

// 尝试加载 Bukkit 的 PlaceholderAPI
try {
    PlaceholderAPI = ext.getStatic("me.clip.placeholderapi.PlaceholderAPI");
    console.log('[PAPI] Found Bukkit PlaceholderAPI Hooking...')
} catch (ex) {
}

// 尝试加载 Sponge 的 PlaceholderAPI
try {
    /** @namespace server.service */
    var spongePapi = server.service.get('me.rojo8399.placeholderapi.PlaceholderService');
    var TextSerializers = Java.type('org.spongepowered.api.text.serializer.TextSerializers');
    var s = TextSerializers.formattingCode('§');
    if (spongePapi) {
        PlaceholderAPI = {
            setPlaceholders: function () {
                return s.serialize(spongePapi.replacePlaceholders(arguments[1], arguments[0], arguments[0]));
            }
        };
        console.log('[PAPI] Found Sponge PlaceholderAPI Hooking...')
    }
} catch (ex) {
}

function replace() {
    var player = arguments[0];
    var line = [];
    if (arguments.length === 1) {
        player = null;
        line = player;
    }
    if (toString.call(line) === "[object Array]") {
        return PlaceholderAPI.setPlaceholders(player, line.join('\n')).split('\n');
    }
    return PlaceholderAPI.setPlaceholders(player, line);
}

exports = module.exports = {
    $: replace
};
