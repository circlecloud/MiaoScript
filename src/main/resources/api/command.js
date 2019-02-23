/*global Java, base, module, exports, require*/
function CommandHandlerDefault() {
    this.on = function(jsp, name, exec) {
        var cmd = this.create(jsp, { name: name });
        if (exec.cmd && typeof exec.cmd === "function") {
            console.debug('插件 %s 设置命令 %s 执行器(%s) ...'.format(jsp.description.name, name, cmd));
            this.onCommand(jsp, cmd, exec.cmd)
        } else {
            throw Error("CommandExec Must be a function... Input: " + exec.cmd)
        }
        if (exec.tab && typeof exec.tab === "function") {
            console.debug('插件 %s 设置命令 %s 自动补全(%s) ...'.format(jsp.description.name, name, cmd));
            this.onTabComplete(jsp, cmd, exec.tab)
        }
    }
}
var CommandHandler = Object.assign(new CommandHandlerDefault(), requireInternal('command'));

exports = module.exports = CommandHandler;
