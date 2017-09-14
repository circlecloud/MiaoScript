'use strict';
/*global require*/
var global = this;
load(rootDir + '/modules/ext.js');
load(rootDir + '/modules/static.js');

function init(plugin, engine) {
    log.d("Version: %s", plugin.getDescription().getVersion());
}