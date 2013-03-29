/**
 * 选项页
 */
define(function(require, exports) {
	'require:nomunge,exports:nomunge,module:nomunge';

	// 后台页数据模型
	var model = chrome.extension.getBackgroundPage().model,

	// 渲染器
	Render = require('./model/render.js'),

	// 选项渲染器
	optionRender = new Render('optionTemp'),

	// 是否显示IP
	showIP = null;

	// 初始化
	$('body').append(optionRender.render({}));
	showIP = $('#showIP').click(function() {
		model.put('showIP', this.checked ? '1' : '0');
	});
	if (model.get('showIP') == '1') {
		showIP.attr('checked', 'checked');
	}
	if (model.get('benchmarking') == '0') {
		$('#clearCache').attr('disabled', 'disabled').next().css('opacity', .75);
	}
	$('#' + model.get('method')).attr('checked', 'checked');
	$(':radio').click(function() {
		model.put('method', this.value);
	});

});
