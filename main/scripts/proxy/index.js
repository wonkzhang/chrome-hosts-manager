/**
 * 入口文件
 */
define(function (require, exports) {

    exports.createServer = function() {
        var proxyServer = require('./proxyServer.js');
        new proxyServer();
    };

    exports.openChrome = function() {
        var openChrome = require('./openChrome.js');
        new openChrome();
    };
});
