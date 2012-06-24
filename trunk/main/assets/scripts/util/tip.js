/**
 * 弹出提示
 */
define(function(require, exports) {

	// body
	var body = $('body').css('min-width', '410px'),

	// title
	titleTip = $('#titleTip'),

	// 错误信息
	errorTip = $('#errorTip').removeClass('hidden'),

	// 错误信息
	infoTip = $('#infoTip').removeClass('hidden'),

	// 当前信息
	currentTip = null,

	// 确认后要继续执行的方法
	confirmFn = null,

	/**
	 * 显示title
	 */
	showTip = function() {
		var position = titleTip.data('position'),
		width = titleTip.outerWidth(),
		bodyWidth = body.innerWidth();
		position.top -= titleTip.height() + 16;
		position.left -= width / 2;
		if (position.top < 0) {
			position.top = 0;
		}
		if (position.left < 0) {
			position.left = 0;
		}
		if (position.left > bodyWidth - width) {
			position.left = bodyWidth - width;
		}
		titleTip.css(position).addClass('tip-show');
	};

	/**
	 * 显示错误信息
	 */
	exports.showErrorTip = function(text) {
		if (currentTip != errorTip) {
			exports.close();
			currentTip = errorTip;
		}
		clearTimeout(errorTip.data('timeout'));
		errorTip.children().eq(0).text(text);
		errorTip.css('left', (body.innerWidth() - errorTip.outerWidth()) / 2);
		errorTip.addClass('tip-show').data('timeout', setTimeout(exports.close, 8000));
	};

	/**
	 * 显示错误信息
	 */
	exports.showInfoTip = function(text, fn) {
		confirmFn = fn;
		if (currentTip != infoTip) {
			exports.close();
			currentTip = infoTip;
		}
		clearTimeout(infoTip.data('timeout'));
		infoTip.children().eq(0).text(text);
		infoTip.css('left', (body.innerWidth() - infoTip.outerWidth()) / 2);
		infoTip.addClass('tip-show').data('timeout', setTimeout(exports.close, 8000));
	};

	/**
	 * 按钮文字提示
	 */
	exports.showTip = function(evt) {
		var target = $(evt.target);
		clearTimeout(titleTip.data('timeout'));
		if (evt.type == 'mousemove') {
			titleTip.html(target.data('title')).data('position', {
				left: evt.clientX,
				top: evt.clientY
			}).removeClass('hidden');
			titleTip.data('timeout', setTimeout(showTip, 400));
		} else {
			titleTip.css('top', '-50px').addClass('hidden').removeClass('tip-show');
		}
	};

	/**
	 * 确认提示
	 */
	exports.confirm = function() {
		confirmFn && confirmFn();
		exports.close();
	};

	/**
	 * 关闭提示
	 */
	exports.close = function() {
		if (currentTip) {
			clearTimeout(currentTip.data('timeout'));
			currentTip.removeClass('tip-show');
			currentTip = null;
		}
	};
});