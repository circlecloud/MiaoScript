/*global Java, base, module, exports, require*/
var chat = require('api/chat');
var server = require('api/server');

var ChatMessagePart = function () {
    this.click = function (action, value) {
        this.clickEventAction = action;
        this.clickEventValue = value;
    };

    this.hover = function (action, value) {
        this.hoverEventAction = action;
        this.hoverEventValue = value;
    };

    this.convert = function () {
        var str = {};
        if (this.text) {
            str.text = this.text;
        }
        if (this.clickEventAction) {
            str.clickEvent = {
                "action": this.clickEventAction,
                "value": this.clickEventValue
            }
        }
        if (this.hoverEventAction) {
            str.hoverEvent = {
                "action": this.hoverEventAction,
                "value": this.hoverEventValue
            }
        }
        if (this.insertion) {
            str.insertion = this.insertion;
        }
        return str;
    }
};

var Tellraw = function () {
    var parts = [new ChatMessagePart()];
    var self = this;

    this.then = function (part) {
        if (typeof part === "string") {
            var newPart = new ChatMessagePart();
            newPart.text = part;
            this.then(newPart);
            return self;
        }
        var last = this.latest();
        if (!last.text) {
            last.text = part.text;
        } else {
            parts.push(part);
        }
        this.cache = null;
    };

    this.text = function (text) {
        this.latest().text = text;
        return this;
    };

    this.tip = function (str) {
        if (toString.call(str) === "[object Array]") {
            str = str.join("\n");
        }
        this.latest().hover("show_text", str);
        return this;
    };

    this.item = function (str) {
        this.latest().hover("show_item", str);
        return this;
    };

    this.cmd = this.command = function (command) {
        this.latest().click("run_command", command);
        return this;
    };

    this.suggest = function (url) {
        this.latest().click("suggest_command", url);
        return this;
    };

    this.file = function (path) {
        this.latest().click("open_file", path);
        return this;
    };

    this.link = function (url) {
        this.latest().click("open_url", url);
        return this;
    };

    this.latest = function () {
        return parts[parts.length - 1];
    };

    this.json = function () {
        if (!this.cache) {
            var temp = [];
            parts.forEach(function (t) {
                temp.push(t.convert());
            });
            this.cache = JSON.stringify(temp);
            console.debug(this.cache);
        }
        return this.cache;
    };

    this.send = function (player) {
        chat.json(player, self.json());
    };

    this.sendAll = function () {
        server.players(function sendAllMessage(p) {
            self.send(p);
        })
    }
};

Tellraw.create = function () {
    return new Tellraw().then(Tellraw.duplicateChar);
};

Tellraw.duplicateChar = '§卐';

exports = module.exports = Tellraw;