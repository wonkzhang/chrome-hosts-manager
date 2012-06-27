/**
 * 初始化页面
 */
define(function(require, exports) {

	// 视图逻辑
	var view = require('./handle/view.js');

	// 渲染头
	view.renderHead();

	// 绑定事件
	require('./bind.js');

	// 加载样式
	require('../styles/common.css');
	require('../styles/icons.css');
	require('../styles/popup.css');
	
	// 刷新数据
	view.refresh(false);

	// 初始化时给出的提示信息
	view.initInfoTip();

	// 显示当前tab的IP
	view.showCurrentIP();
});