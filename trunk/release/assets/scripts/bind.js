/**
 * \u4e8b\u4ef6\u7ed1\u5b9a
 */
define(function(require, exports) {

	// \u89c6\u56fe\u903b\u8f91
	var view = require('./handle/view.js');

	$('body')

	// \u7ec4\u9ad8\u4eae
	.on('mouseenter mouseleave', '.group', function(evt) {
		$(this).parent()[evt.type == 'mouseenter' ? 'addClass' : 'removeClass']('hover');
	})

	// \u6587\u5b57\u63d0\u793a
	.on('mousemove mouseout', 'span[data-title]', function(evt) {
		view.showTip(evt);
	})

	// \u6309\u94ae\u70b9\u51fb
	.on('click', 'span[data-handle]', function(evt) {
		var target = $(evt.target);
		view[target.data('handle')](target);
	})

	// \u5bf9\u884c\u5185\u975e\u6309\u94ae\u533a\u57df\u7684\u70b9\u51fb\u7ed1\u5b9a\u5230\u542f\u7528\u6309\u94ae\u4e0a
	.on('click', '.node', function(evt) {
		!evt.target.getAttribute('data-handle') && view.check($(this).find('span[data-handle="check"]'));
	})

	// \u7f16\u8f91\u53d6\u6d88
	.on('click', '#mask', function(evt) {
		evt.target.id == 'mask' && view.olCancel();
	})

	/********** \u4ee5\u4e0b\u4e3a\u81ea\u5b9a\u4e49\u4e8b\u4ef6 **********/

	// "\u542f\u7528/\u7981\u7528"\u4e8b\u4ef6
	.on('checkon checkoff', '.node', function(evt) {
		$(this).find('span[data-handle="check"]').removeClass('checkon checkoff').addClass(evt.type);
	})

	// "\u5220\u9664"\u4e8b\u4ef6
	.on('remove', '.node', function(evt) {
		var $this = $(this);
		if ($this.hasClass('group')) {
			$this.closest('.block').remove();
		} else {
			$this.remove();
		}
	})

	// \u7981\u7528\u53f3\u952e
	.on('contextmenu', function() {
		return false;
	});

	// \u6eda\u52a8\u7279\u6548
	$('#content').bind('scroll', function() {
		if (this.scrollHeight > this.clientHeight) { // \u51fa\u73b0\u6eda\u52a8\u6761
			view.scroll($(this));
		}
	});

});
