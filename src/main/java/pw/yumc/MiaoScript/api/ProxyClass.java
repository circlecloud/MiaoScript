package pw.yumc.MiaoScript.api;

import javax.script.Bindings;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

/**
 * Created with IntelliJ IDEA
 *
 * @author MiaoWoo
 * Created on 2020/1/16 9:04.
 */
public class ProxyClass {
    private ScriptEngine engine;
    private String script;
    private Bindings bindings;

    public ProxyClass(ScriptEngine engine, String script, Bindings bindings) {
        this.engine = engine;
        this.script = script;
        this.bindings = bindings;
    }

    public Object method(Object args) throws ScriptException {
        bindings.put("args", args);
        return engine.eval(script, bindings);
    }

    public Object one(Object arg1) throws ScriptException {
        bindings.put("arg1", arg1);
        return engine.eval(script, bindings);
    }

    public Object two(Object arg1, Object arg2) throws ScriptException {
        bindings.put("arg1", arg1);
        bindings.put("arg2", arg2);
        return engine.eval(script, bindings);
    }

    public Object three(Object arg1, Object arg2, Object arg3) throws ScriptException {
        bindings.put("arg1", arg1);
        bindings.put("arg2", arg2);
        bindings.put("arg3", arg3);
        return engine.eval(script, bindings);
    }

    public Object args(Object... args) throws ScriptException {
        bindings.put("args", args);
        return engine.eval(script, bindings);
    }
}
