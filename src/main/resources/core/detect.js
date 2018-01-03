/**
 * 服务器探测类
 */
/*global base*/
var ServerType = {
    Bukkit: 'bukkit',
    Sponge: 'sponge'
};
var MServer;
var DetectServerType = ServerType.Bukkit;
try {
    MServer = Java.type("org.bukkit.Bukkit");
    DetectServerType = ServerType.Bukkit;
} catch (ex) {
    // IGNORE
}
try {
    MServer = Java.type("org.spongepowered.api.Sponge");
    DetectServerType = ServerType.Sponge;
} catch (ex) {
    // IGNORE
}
/**
 * 尝试加载特殊的Console类
 */
try {
    load(root + '/internal/' + DetectServerType + '/console.js');
} catch (ex) {
    // IGNORE
}
global.console = new global.Console();