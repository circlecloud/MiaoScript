/*global Java, base, module, exports, require*/
function impl(name) {
    return require('../internal/' + DetectServerType + '/' + name);
}

module.exports = {
    command: impl('command'),
    event: impl('event'),
    permission: impl('permission'),
    plugin: impl('plugin'),
    server: impl('server'),
    task: impl('task')
};