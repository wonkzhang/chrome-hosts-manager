/**
 * \u7f16\u8f91\u5c42
 */
define(function(require, exports) {

	// \u6e32\u67d3\u5668
	var Render = require('../model/render.js'),

	// \u6d6e\u5c42\u6e32\u67d3\u5668
	olRender = new Render('olTemp'),
	
	// \u8868\u5355\u57df\u6e32\u67d3\u5668
	fieldRender = new Render('fieldTemp'),

	// \u5de5\u5177\u96c6
	util = require('../util/util.js'),

	// \u906e\u7f69
	mask = $('#mask').hide(),

	// \u6d6e\u5c42
	overlay = $('#overlay'),

	// \u5f53\u524d\u7f16\u8f91\u4e2d\u7684\u8868\u5355\u9879
	olFields = null;

	/**
	 * \u663e\u793a\u7f16\u8f91\u5c42
	 * @param title \u6807\u9898
	 * @param fields \u8981\u7f16\u8f91\u7684\u8868\u5355\u9879
	 * @param save \u4fdd\u5b58\u6309\u94ae\u7684\u56de\u8c03\u65b9\u6cd5
	 */
	exports.show = function(title, fields, save) {
		var html = '';
		field = null,
		olFields = {},
		olSave = save;
		for (var i = 0; i < fields.length; i++) {
			field = olFields[fields[i].name] = {
				label: olRender.render(null, fields[i].label),
				check: fields[i].check
			};
			html += fieldRender.render({
				name: fields[i].name,
				label: field.label,
				value: fields[i].value
			});
		}
		overlay.html(olRender.render({
			title: title,
			fields: html
		}));
		mask.fadeIn();
	};

	/**
	 * \u4fdd\u5b58\u6570\u636e
	 */
	exports.save = function() {
		if (olSave) {
			var fieldError = false,
			data = {};
			overlay.find('input').each(function() {
				var value = $.trim(this.value),
				check = olFields[this.name].check;
				if (check) { // \u9700\u8981\u6821\u9a8c
					if (typeof check == 'string' ? util[check](value) : check.test(value)) {
						data[this.name] = value;
					} else {
						fieldError = olRender.render(null, olFields[this.name].label);
						return false;
					}
				} else { // \u4e0d\u9700\u8981\u6821\u9a8c
					data[this.name] = value;
				}
			});
			if (fieldError) {
				fieldError =  '[' + fieldError + ']' + util.i18n('fieldError');
			}
			olSave(fieldError, data);
		}
	};

	/**
	 * \u9690\u85cf\u7f16\u8f91\u5c42
	 */
	exports.hide = function() {
		mask.fadeOut();
		olFields = olSave = null;
	};
});
