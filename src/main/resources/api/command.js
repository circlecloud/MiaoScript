'use strict';
/**
 * MiaoScript Command处理类
 */
/*global Java, base, module, exports, require*/
function CommandHandlerDefault() {
    this.on = function(jsp, name, exec) {
        var cmd = this.create(jsp, { name: name });
        console.debug('插件 %s 创建命令 %s(%s)...'.format(jsp.description.name, name, cmd))
        if (exec.cmd && typeof exec.cmd === "function") {
            this.onCommand(jsp, cmd, exec.cmd)
        } else {
            throw Error("CommandExec Must be a function... Input: " + exec.cmd)
        }
        if (exec.tab && typeof exec.tab === "function") {
            this.onTabComplete(jsp, cmd, exec.tab)
        }
    }
}
exports = module.exports = Object.assign(new CommandHandlerDefault(), requireInternal('command'));
