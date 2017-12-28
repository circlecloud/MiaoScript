/*global Java, base, module, exports, require*/
var Player = {
    createNew: function (inner) {
        var player = {};
        player.handler = inner;
        player.sendMessage = function (msg) {
            this.handler.sendMessage(msg);
        };
        return player;
    }
};

exports.$ = Player.createNew;