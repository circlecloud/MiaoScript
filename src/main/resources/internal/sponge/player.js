/*global Java, base, module, exports, require*/
var Player = {
    createNew: function (inner) {
        var player = {};
        var Text = Java.type('org.spongepowered.api.text.Text');
        player.handler = inner;
        player.sendMessage = function (msg) {
            this.handler.sendMessage(Text.of(msg));
        };
        return player;
    }
};

exports.$ = Player.createNew;