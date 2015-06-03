(function () {

    var Http = require('http');
    var Net = require('net');
    var Url = require('url');
    var HttpProxy = require('http-proxy');

    /**
     * 代理主要功能定义
     */
    define(function (require, exports, module) {
        var Extend = require('./util/extend.js');

        /**
         * 代理服务类
         * @param options
         * @constructor
         */
        var ProxyServer = function (options) {
            this.options = Extend({
                host: '127.0.0.1',
                port: '8091'
            }, options);

            this.init();
        };

        /**
         * 初始化,唯一入口
         */
        ProxyServer.prototype.init = function () {
            this.build();
            this.chreateServer();
            this.listenServer();
        };

        /**
         * 构建this.全局变量,只能在这里构建
         */
        ProxyServer.prototype.build = function () {
            this.httpServer = null;
        };

        /**
         * 创建服务
         */
        ProxyServer.prototype.chreateServer = function () {

            this.httpServer = Http.createServer(function (req, res) {
                var urlObj = Url.parse(req.url),
                    pHost = urlObj.host,
                    pPort = urlObj.port,
                    pPath = urlObj.path,
                    httpProxy = HttpProxy.createProxyServer({}),
                    proxyOptions = {
                        target: {
                            host: pHost,
                            port: pPort
                        }
                    };

                //http://qunarzz.com/home/prd/styles/home@36aa99236f64d5e69d851f4aebb50438.css
                //http://qunarzz.com/flight/prd/styles/wide/usage/home/page/home@7f378b9cd766fedebaa10cd76cb78728.css
                if (req.url.indexOf('qunarzz.com/flight/') > -1) {
                    var realPath = '/wonk.zhang' + pPath;
                    urlObj.pathname = realPath;
                    req.url = Url.format(urlObj);
                    //console.log('req.url : ', req.url);
                    //proxyOptions.target.host = '127.0.0.1';
                    proxyOptions.target.host = '192.168.237.72';
                    console.log('proxyOptions.target.host : ', proxyOptions.target.host);
                }

                httpProxy.web(req, res, proxyOptions, function (e) {
                    //不好意思,代理出错了
                    //console.log('httpProxy execption : ', e)
                });

            });

            //链接
            this.httpServer.setMaxListeners(0);
            this.httpServer.listen(this.options.port, this.options.host);
        };

        /**
         * 监听服务
         */
        ProxyServer.prototype.listenServer = function() {
            //https全部直接放行
            this.httpServer.on('connect', function (req, socket, head) {
                //console.log('connect');
                var urlObj = Url.parse('http://' + req.url);

                var proxySocket = Net.connect(urlObj.port, urlObj.hostname, function () {
                    socket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent:Proxy\r\n\r\n');
                    proxySocket.write(head);
                    proxySocket.pipe(socket);
                    socket.pipe(proxySocket);
                });

                proxySocket.on('error', function () {
                    //console.log('[https connect error]: ' + urlObj.hostname + ':' + urlObj.port);
                });
            });

            this.httpServer.on('clientError', function () {
                console.log('clientError');
            });

            this.httpServer.on('upgrade', function (req, socket, head) {
                console.log('upgrade');
            });
        };

        module.exports = ProxyServer;
    });
})();