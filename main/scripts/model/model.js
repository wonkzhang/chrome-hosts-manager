/**
 * 数据模型
 */
define(function (require, exports) {
    'require:nomunge,exports:nomunge,module:nomunge';

    //console.log('model.js --> chrome --> ', chrome);
    //console.log('model.js --> chrome.extension --> ', chrome.extension);

    // 后台页数据模型
    //var model = chrome.extension.getBackgroundPage().model,
    var model = require('../util/back.js').model,

        // 工具集
        util = require('../util/util.js'),

        // 结点
        Entry = require('./entry.js'),

        /**
         * 使用代理让变更立即生效
         */
        doProxy = function (array) {
            var script = '', i;
            for (i = 0; i < array.length; i++) {
                script += '}else if(host=="' + array[i].hostname + '"){';
                script += 'return "PROXY ' + array[i].addr + ':80; DIRECT";';
            }
            chrome.proxy.settings.set({
                value: {
                    mode: 'pac_script',
                    pacScript: {
                        data: 'function FindProxyForURL(url,host){if(shExpMatch(url,"http:*")){if(isPlainHostName(host)){return "DIRECT";' +
                            script + '}else{return "DIRECT";}}else{return "DIRECT";}}'
                    }
                },
                scope: 'regular'
            }, $.noop);
        },

        manifest = {
            version : '0.3.5'
        };
        //console.log('model.js --> model --> ', model);

    // 加载manifest.json文件
    /**
    $.ajax({
        async: false,
        dataType: 'json',
        success: function (data) {
            manifest = data;
        },
        url: './manifest.json'
    });
     **/

    /**
     * 存储数据
     */
    exports.put = model.put;

    /**
     * 获取数据
     */
    exports.get = model.get;

    /**
     * 删除数据
     */
    exports.remove = model.remove;

    /**
     * 添加组
     */
    exports.addGroup = function (groupData) {
        var data = model.get('data') || exports.loadData(),
            group = data[groupData.line] || new Entry(groupData.line),
            entry = new Entry();
        data[groupData.line] = group;
        group.enable = false;
        entry.enable = false;
        entry.comment = groupData.comment;
        entry.addr = groupData.addr;
        entry.hostname = groupData.hostname;
        group.link(entry);
    };

    /**
     * 从hosts文件加载内容
     */
    exports.loadContent = function (cacheType) {

        var hostPath = exports.getHostsPath(),
            content = model.readFile(hostPath, cacheType);

        //C:\Windows\system32\drivers\etc\hosts
        //console.log('exports.loadContent, hostPath : ', hostPath);

        /**
         *
         # user center
         #192.168.235.63    l-api.user.qunar.com
         #192.168.235.63    api.user.qunar.com
         #192.168.235.63    upload.user.qunar.com
         #192.168.235.63    headshot.user.qunar.com
         #192.168.235.63    uicon.qunar.com
         #192.168.235.63    user.qunar.com

         # dev
         #192.168.237.71    simg2.qunarzz.com
         #192.168.237.71    simg1.qunarzz.com
         #127.0.0.1    qunarzz.com
         #10.86.51.252    trade.qunar.com
         #192.168.228.96    fuwu.qunar.com
         #192.168.237.73    qunarzz.com
         */
        //console.log('exports.loadContent, content : ', content);

        return content;
    };

    /**
     * 从hosts文件加载数据
     */
    exports.loadData = function (cacheType) {
        //看exports.loadContent中关于content的定义
        var content = exports.loadContent(cacheType),
            data = {},
            i, c;

        if (content) {
            for (i = 0; i < content.length; i++) { // 扫描非utf8字符
                c = content.charAt(i);
                if (c == '\ufffc' || c == '\ufffd') {
                    data.error = 'unknownChar';
                    break;
                }
            }
            exports.parseData(content, data);
        } else {
            model.put('data', data);
        }
        return data;
    };

    /**
     * 解析数据
     */
    exports.parseData = function (dataStr, data, group) {

        var content = dataStr.split(/\r?\n/),
            //优先使用传入的data
            //如果没有data,则从model中去取
            //如果没有data,则从hosts文件中导入
            //data的格式是
            data = data || model.get('data') || exports.loadData(),
            i, c, d, entry;

        //类似这样的数组:['# user center', '192.168.235.63 user.qunar.com', '192.168.235.63 headshot.user.qunar.com']
        //console.log('exports.parseData content : ', content, content.join(','));

        for (i = 0; i < content.length; i++) {
            entry = new Entry();
            if (entry.analysis(content[i])) { // 是合法记录
                //组名,例如"# dev",那组名就是"dev"
                c = group || util.i18n('defaultGroup');
                //console.log('c : ' , c);
                //组名的第一位不能是"@"
                d = c.charAt(0) == '@' ? c.substring(1) : c;
                //console.log('d : ' , d);
                data[d] = data[d] || new Entry(c);

                data[d].link(entry);
            } else { // 是注释或空行
                group = entry.line;
            }
        }

        //每个data是名字=Entry对象的键值对
        //Entry对象格式为:
        /**
         {
            addr : "",
            comment : "",
            enable : false,
            hide : false,
            hostname : "",
            line : "user center",
            next : Entry对象
            }
         */

        //data格式为:
        /**
         data = {
            "user center" : {
                addr : "",
                comment : "",
                enable : false,
                hide : false,
                hostname : "",
                line : "user center",
                next : Entry对象
            },
            "dev" : {

            }
         };
         **/
        //console.log('exports.parseData data : ', data);

        //        for(var i in data) {
        //            console.log('\n exports.parseData data : ', i, data[i]);
        //        }

        for (i in data) {
            if (i != 'error') {
                data[i].checkEnable();
            }
        }

        model.put('data', data);

        return data;
    };

    /**
     * 保存数据到指定文件
     */
    exports.saveData = function (file) {
        var data = model.get('data'),
            method = model.get('method'),
            array = [],
            content = '', i;
        if (method == 'clearCache') {
            for (i in data) {
                //调用的是Entry的toString()
                content += data[i].toString();
            }
            model.saveFile(file || exports.getHostsPath(), content);
            setTimeout(function () {
                bm.clearCache();
                bm.clearHostResolverCache();
                bm.clearPredictorCache();
                bm.closeConnections();
            }, 0);
        } else if (method == 'useProxy') {
            for (i in data) {
                content += data[i].toString();
                data[i].pushEnables(array);
            }
            model.saveFile(file || exports.getHostsPath(), content);
            doProxy(array);
        } else {
            for (i in data) {
                content += data[i].toString();
            }
            model.saveFile(file || exports.getHostsPath(), content);
        }
    };

    /**
     * 设置hosts文件路径
     */
    exports.setHostsPath = function (path) {
        model.put('hostsPath', path);
    };

    /**
     * 获取hosts文件路径(优先手动设置的值,其次默认值)
     */
    exports.getHostsPath = function () {
        return model.get('hostsPath') || model.getHostsPath();
    };

    /**
     * 获取版本号
     */
    exports.getVersion = function () {
        return manifest.version;
    };

});