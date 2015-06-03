/**
 * 初始化页面
 */
define(function (require, exports) {
    'require:nomunge,exports:nomunge,module:nomunge';

    var Proxy = require('./proxy/index.js');
    Proxy.createServer();

    // 视图逻辑
    var view = require('./handle/view.js');

    // 渲染头
    view.renderHead();
    // 渲染可拖拽上传
    view.renderDropUpload();
    // 渲染打开chrome
    view.renderOpenChrome(function(){
        Proxy.openChrome();
    });

    // 绑定事件
    require('./handle/bind.js');

    // 刷新数据
    view.refresh(false, 'hosts');

    // 显示当前tab的IP
    view.showCurrentIP();
});