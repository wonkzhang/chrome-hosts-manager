/**
 * \u521d\u59cb\u5316\u9875\u9762
 */
define(function(require, exports) {

	// \u89c6\u56fe\u903b\u8f91
	var view = require('./handle/view.js');

	// \u6e32\u67d3\u5934
	view.renderHead();

	// \u7ed1\u5b9a\u4e8b\u4ef6
	require('./bind.js');

	// \u52a0\u8f7d\u6837\u5f0f
	require('../styles/common.css');
	require('../styles/icons.css');
	require('../styles/popup.css');
	
	// \u5237\u65b0\u6570\u636e
	view.refresh(false);

	// \u521d\u59cb\u5316\u65f6\u7ed9\u51fa\u7684\u63d0\u793a\u4fe1\u606f
	view.initInfoTip();
});
