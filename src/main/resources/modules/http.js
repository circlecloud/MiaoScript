'use strict';
/**
 * HTTP 网络类
 * Created by 蒋天蓓 on 2017/2/9 0009.
 */

/*global Java, base, module, exports, require, __FILE__*/

var URL = Java.type("java.net.URL");
var Files = Java.type("java.nio.file.Files");
var Paths = Java.type("java.nio.file.Paths");
var String = Java.type("java.lang.String");

var HttpURLConnection = Java.type("java.net.HttpURLConnection");
var HttpsURLConnection = Java.type("javax.net.ssl.HttpsURLConnection");
var SSLContext = Java.type("javax.net.ssl.SSLContext");

var HostnameVerifier = Java.type("javax.net.ssl.HostnameVerifier");
var X509TrustManager = Java.type("javax.net.ssl.X509TrustManager");

var TrustAnyHostnameVerifier = new HostnameVerifier({
    verify: function (hostname, session) {
        return true;
    }
})

var SSLSocketFactory = function initSSLSocketFactory() {
    var sslContext = SSLContext.getInstance("TLS");
    sslContext.init(null, [new X509TrustManager({
        getAcceptedIssuers: function () {
            return null;
        },
        checkClientTrusted: function (chain, authType) {},
        checkServerTrusted: function (chain, authType) {}
    })], new java.security.SecureRandom());
    return sslContext.getSocketFactory();
}();

var config = {
    Charset: 'UTF-8',
    ConnectTimeout: 10000,
    ReadTimeout: 10000
}

function open(url, method, header) {
    // conn.setRequestProperty
    var conn = new URL(url).openConnection();
    if (conn instanceof HttpsURLConnection) {
        conn.setHostnameVerifier(TrustAnyHostnameVerifier);
        conn.setSSLSocketFactory(SSLSocketFactory);
    }
    conn.setRequestMethod(method);
    conn.setDoOutput(true);
    conn.setDoInput(true);
    conn.setConnectTimeout(config.ConnectTimeout);
    conn.setReadTimeout(config.ReadTimeout);
    for (var key in header) {
        conn.setRequestProperty(key, header[key]);
    }
    return conn;
}

function buildUrl(url, params) {
    if (params && Object.keys(params).length > 0) {
        var queryStart = url.indexOf('?');
        if (queryStart == -1) {
            url += '?';
        }
        for (var key in params) {
            url += key;
            url += '=';
            url += params[key];
            url += '&';
        }
        return url.substr(0, url.length - 1);
    }
    return url;
}

function request(url, method, header, params, body) {
    var conn = open(buildUrl(url, params), method, header);
    try {
        conn.connect();
        if (body) {
            var out = conn.getOutputStream();
            out.write(new String(body).getBytes(config.Charset));
            out.flush();
            out.close();
        }
        return response(conn);
    } finally {
        conn.disconnect();
    }
}

function response (conn) {
    var temp = Paths.get(java.lang.System.getProperty("java.io.tmpdir"), java.util.UUID.randomUUID().toString());
    Files.copy(conn.getInputStream(), temp);
    var result = new String(Files.readAllBytes(temp), config.Charset);
    var tempFile = temp.toFile();
    tempFile.delete() || tempFile.deleteOnExit();
    return result;
}

var http = {
    config: config
};

['GET', 'POST', 'PUT', 'DELETE', 'HEADER'].forEach(function(method){
    http[method.toLowerCase()] = function (url, header, params, body) {
        return request(url, method, header, params, body);
    }
})

exports = module.exports = http;
