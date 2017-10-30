module.exports = {
    command: require('./' + DetectServerType + '/command'),
    event: require('./' + DetectServerType + '/event'),
    permission: require('./' + DetectServerType + '/permission'),
    plugin: require('./' + DetectServerType + '/plugin'),
    server: require('./' + DetectServerType + '/server'),
    task: require('./' + DetectServerType + '/task')
}