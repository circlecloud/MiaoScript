/**
 * Sponge 玩家方法代理类
 * Created by 蒋天蓓 on 2018/1/5 0009.
 */
/*global Java, base, module, exports, require*/
var ref = require('reflect');
var Text = Java.type('org.spongepowered.api.text.Text');
var Player = {
    createNew: function createNew(inner) {
        var player = {};
        player.handler = inner;
        player.sendMessage = function (msg) {
            this.handler.sendMessage(Text.of(msg));
        };
        return Object.assign(ref.mapToObject(inner), player);
    }
};

exports.$ = Player.createNew;