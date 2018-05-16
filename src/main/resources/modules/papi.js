'use strict';
/**
 * PAPI扩展类
 */
/*global Java, base, module, exports, require, __FILE__*/
var PlaceholderAPI;
var server = require('api/server');

PlaceholderAPI = {
    setPlaceholders: function () {
        return arguments[1].replace(/&([1-9a-fA-F])/,'§$1');
    }
}

// 尝试加载 Bukkit 的 PlaceholderAPI
try {
    PlaceholderAPI = ext.getStatic("me.clip.placeholderapi.PlaceholderAPI");
    console.log('[PAPI] Found Bukkit PlaceholderAPI Hooking...')
} catch (ex) {
}

// 尝试加载 Sponge 的 PlaceholderAPI
try {
    var spapi = server.service.get('me.rojo8399.placeholderapi.PlaceholderService');
    var TextSerializers = Java.type('org.spongepowered.api.text.serializer.TextSerializers');
    var s = TextSerializers.formattingCode('§');
    if (spapi) {
        PlaceholderAPI = {
            setPlaceholders: function () {
                return s.serialize(spapi.replacePlaceholders(arguments[1], arguments[0], arguments[0]));
            }
        }
        console.log('[PAPI] Found Sponge PlaceholderAPI Hooking...')
    }
} catch (ex) {
}

function replace() {
    if (arguments.length > 1) {
        return PlaceholderAPI.setPlaceholders(arguments[0], arguments[1]);
    } else {
        return PlaceholderAPI.setPlaceholders(null, arguments[0]);
    }
}

exports = module.exports = {
    $: replace
}
