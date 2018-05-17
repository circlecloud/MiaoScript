'use strict';
/**
 * 反射工具类
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */

/*global Java, base, module, exports, require, __FILE__*/
var Class = Java.type('java.lang.Class');
var NoSuchFieldException = Java.type('java.lang.NoSuchFieldException');
var methodCache = [];

function Reflect(obj) {
    if (obj instanceof Class) {
        this.obj = null;
        this.class = obj;
    } else {
        this.obj = obj;
        this.class = obj.class;
    }

    this.field = function (name) {
        try {
            // Try getting a public field
            var field = this.class.field(name);
            return on(field.get(this.obj));
        } catch (ex) {
            // Try again, getting a non-public field
            try {
                return on(accessible(declaredField(this.class, name)).get(this.obj));
            } catch (ex) {
                throw new NoSuchFieldException(ex);
            }
        }
    };

    this.call = function () {
        var name = arguments[0];
        var params = Array.prototype.slice.call(arguments, 1);
        var method = declaredMethod(this.class, name, types(params));
        return on(method.invoke(this.get(), params));
    };

    this.get = function () {
        return arguments.length === 1 ? this.field(arguments[0]) : this.obj;
    };

    // noinspection JSUnusedGlobalSymbols
    this.set = function (name, value) {
        accessible(declaredField(this.class, name)).set(this.obj, value);
        return this;
    };

    this.create = function () {
        var param = Array.prototype.slice.call(arguments);
        return on(declaredConstructor(this.class, param).newInstance(param));
    };
}

/**
 * Get an array of types for an array of objects
 */
function types(values, def) {
    if (values === null) {
        return [];
    }
    var result = [];
    values.forEach(function (t) {
        result.push((t || def) ? Object.class : t instanceof Class ? t : t.class)
    });
    return result;
}

function accessible(accessible) {
    if (accessible === null) {
        return null;
    }
    if (!accessible.isAccessible()) {
        accessible.setAccessible(true);
    }
    return accessible;
}

function declaredConstructor(clazz, param) {
    var constructor;
    try {
        constructor = clazz.getDeclaredConstructor(types(param));
    } catch (ex) {
        try {
            constructor = clazz.getDeclaredConstructor(types(param, true));
        } catch (ex) {
            constructor = clazz.getDeclaredConstructors()[0];
        }
    }
    return accessible(constructor);
}

function declaredField(clazz, name) {
    var field = null;
    // noinspection JSUnresolvedVariable
    while (clazz !== java.lang.Object.class) {
        try {
            field = clazz.getDeclaredField(name);
            if (field !== null) {
                break;
            }
        } catch (e) {
            clazz = clazz.getSuperclass();
        }
    }
    if (field === null) {
        throw new NoSuchFieldException(name + " is not found in " + clazz.name);
    }
    return field;
}

function declaredMethod(clazz, name, clazzs) {
    var key = clazz.name + '.' + name + ':' + (clazzs || []).join(':');
    if (!methodCache[key]) {
        try {
            methodCache[key] = clazz.getMethod(name, clazzs);
        } catch (ex) {
            methodCache[key] = clazz.getDeclaredMethod(name, clazzs);
        }
    }
    return methodCache[key];
}

function declaredMethods(clazz) {
    return clazz.declaredMethods;
}

var classMethodsCache = [];

function mapToObject(javaObj) {
    if (!javaObj || !javaObj.class) {
        throw new TypeError('参数 %s 不是一个Java对象!'.format(javaObj))
    }
    var target = {};
    getJavaObjectMethods(javaObj).forEach(function proxyMethod(t) {
        mapMethod(target, javaObj, t)
    });
    return target;
}

function getJavaObjectMethods(javaObj) {
    var className = javaObj.class.name;
    if (!classMethodsCache[className]) {
        var names = [];
        var methods = javaObj.class.methods;
        for (var i in methods) {
            names.push(methods[i].name);
        }
        classMethodsCache[className] = names;
    }
    return classMethodsCache[className];
}

function mapMethod(target, source, name) {
    target[name] = function __SimpleDynamicMethod__() {
        if (arguments.length > 0) {
            return source[name](Array.prototype.slice.call(arguments));
        } else {
            return source[name]();
        }
    };
}

function on(obj) {
    if (!obj || !obj.class) {
        throw new TypeError('参数 %s 不是一个Java对象!'.format(obj))
    }
    return new Reflect(obj);
}

// noinspection JSUnusedGlobalSymbols
exports = module.exports = {
    on: on,
    accessible: accessible,
    declaredMethods: declaredMethods,
    mapToObject: mapToObject
};
