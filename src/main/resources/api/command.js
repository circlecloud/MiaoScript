/*global Java, base, module, exports, require*/
function CommandHandlerDefault() {
    this.on = function (jsp, name, exec) {
        var cmd = this.create(jsp, { name: name });
        console.debug('插件 %s 设置命令 %s 执行器(%s) ...'.format(jsp.description.name, name, cmd));
        if (exec.cmd) { this.onCommand(jsp, cmd, exec.cmd) }
        if (exec.tab) { this.onTabComplete(jsp, cmd, exec.tab) }
    }
}
var CommandHandler = Object.assign(new CommandHandlerDefault(), requireInternal('command'));

exports = module.exports = CommandHandler;
