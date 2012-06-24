/**
 * \u5f39\u51fa\u63d0\u793a
 */
define(function(require, exports) {

	// body
	var body = $('body').css('min-width', '410px'),

	// title
	titleTip = $('#titleTip'),

	// \u9519\u8bef\u4fe1\u606f
	errorTip = $('#errorTip').removeClass('hidden'),

	// \u9519\u8bef\u4fe1\u606f
	infoTip = $('#infoTip').removeClass('hidden'),

	// \u5f53\u524d\u4fe1\u606f
	currentTip = null,

	// \u786e\u8ba4\u540e\u8981\u7ee7\u7eed\u6267\u884c\u7684\u65b9\u6cd5
	confirmFn = null,

	/**
	 * \u663e\u793atitle
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
	 * \u663e\u793a\u9519\u8bef\u4fe1\u606f
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
	 * \u663e\u793a\u9519\u8bef\u4fe1\u606f
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
	 * \u6309\u94ae\u6587\u5b57\u63d0\u793a
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
	 * \u786e\u8ba4\u63d0\u793a
	 */
	exports.confirm = function() {
		confirmFn && confirmFn();
		exports.close();
	};

	/**
	 * \u5173\u95ed\u63d0\u793a
	 */
	exports.close = function() {
		if (currentTip) {
			clearTimeout(currentTip.data('timeout'));
			currentTip.removeClass('tip-show');
			currentTip = null;
		}
	};
});
