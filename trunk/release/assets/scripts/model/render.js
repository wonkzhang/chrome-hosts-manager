/**
 * \u6e32\u67d3\u5668
 */
define(function(require, exports, module) {

	// \u5de5\u5177\u7c7b
	var util = require('../util/util.js'),

	/**
	 * \u6784\u9020\u65b9\u6cd5
	 * @param template \u6a21\u677fid
	 */
	Render = function(template) {
		if (template) {
			this.template = document.getElementById(template).innerHTML;
		}
	};

	Render.prototype = {

		/**
		 * \u5c06\u5bf9\u8c61\u6e32\u67d3\u5230\u6a21\u677f
		 * \u4ee5\u4e0b\u51e0\u79cd\u5f62\u5f0f\u5c06\u88ab\u53d8\u91cf\u66ff\u6362:
		 * {{:text}} \u4ece\u56fd\u9645\u5316\u6587\u4ef6\u4e2d\u83b7\u53d6text
		 * {{a.b}} \u76f8\u5f53\u4e8eobj.a.b
		 * {{a.b?1:2}} \u76f8\u5f53\u4e8eobj.a.b?1:2
		 */
		render: function(obj, template) {
			return (template || this.template).replace(/\{\{([:\w\.\?]+)\}\}/g, function(str, p1) {
				if (p1.charAt(0) == ':') {
					return util.i18n(p1.substring(1));
				} else if (obj) {
					var i, j = obj, p = p1.split('?'), q = p[0].split('.');
					for (i = 0; i < q.length; i++) {
						if (q[i] in j) {
							j = j[q[i]];
						} else {
							return '';
						}
					}
					if (p[1]) {
						p = p[1].split(':');
						return j ? p[0] : p[1];
					}
					return j;
				} else {
					return '';
				}
			});
		}
	};

	module.exports = Render;

});
