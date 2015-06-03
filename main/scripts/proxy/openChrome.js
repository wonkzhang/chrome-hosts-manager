var ChildProcess = require('child_process');

/**
 *
 */
define(function (require, exports, module) {

    var Extend = require('./util/extend.js');

    /**
     * 主要操作类
     * @constructor
     */
    var Opener = function(options) {
        this.options = Extend({
            host: '127.0.0.1',
            port: '8091'
        }, options);

        this.init();
    };

    Opener.prototype.init = function() {
        this.build();
        this.showChrome();
    };

    Opener.prototype.build = function() {

    };

    Opener.prototype.showChrome = function() {
        var execArr = ['start chrome'];
        //execArr.push('%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe');
        execArr.push('--start-maximized');
        execArr.push('--proxy-server="' + this.options.host + ':' + this.options.port + '"');
        //execArr.push('--disable-javascript');
        //execArr.push('--disable-images');
        //execArr.push('--host-rules="MAP *.qunarzz.com 127.0.0.1"');
        var execStr = execArr.join(' ');
        var exec = ChildProcess.exec;
        var last = exec(execStr);

        last.stdout.on('data', function (data) {
            console.log('标准输出：' + data);
        });
        last.on('exit', function (code) {
            //console.log('子进程已关闭，代码：' + code);
        });

        console.log('打开chrome执行命令: ', execStr);
    };

    module.exports = Opener;
});