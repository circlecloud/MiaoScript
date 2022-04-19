declare const global: any
declare const root: string
declare const base: Core
declare function engineLoad(str: string | { script: string, name: string }): any
interface Core {
    version: string
    getClass(name: String): any
    getProxyClass(): any
    getJavaScriptTaskClass(): any
    getInstance(): any
    read(path: string): string
    save(path: string, content: string): void
    delete(path: string): void
}
namespace Java {
    function type<T = any>(clazz: string): T
    function from<T = any>(javaObj: T[]): T[]
    function to<T = any>(array: T[], type?: T): T[]
    function extend(...parentTypes: any[]): any
    function synchronized(func: () => void, lock: any): Function
    function isJavaObject(obj: any): boolean
    function asJSONCompatible<T = any>(obj: T): T
    //@ts-ignore
    // function super(type: any);
}
