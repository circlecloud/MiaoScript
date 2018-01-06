/*global Java, base, module, exports, require*/
function impl(name) {
    return require('../internal/' + DetectServerType + '/' + name, {warnNotFound: false});
}

exports = module.exports = {
    command: impl('command'),
    event: impl('event'),
    permission: impl('permission'),
    server: impl('server'),
    task: impl('task'),
    item: impl('item')
};