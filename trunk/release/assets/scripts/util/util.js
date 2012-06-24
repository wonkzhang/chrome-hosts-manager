/**
 * \u5de5\u5177\u96c6
 */
define(function(require, exports) {

	// \u540e\u53f0\u9875\u5de5\u5177\u96c6
	var util = chrome.extension.getBackgroundPage().util,

	// \u662f\u5426\u662f\u5408\u6cd5\u7684IPv4\u5730\u5740
	isV4 = function(ip) {
		if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
			ip = ip.split('.');
			for (i = 0; i < ip.length; i++) {
				if (Number(ip[i]) > 255) {
					return false;
				}
			}
			return true;
		} else {
			return false;
		}
	};

	/**
	 * \u662f\u5426\u662f\u5408\u6cd5\u7684IP\u5730\u5740
	 */
	exports.isValidIP = function(ip) {
		var i, parts;
		if (isV4(ip)) { // IPv4
			return true;
		} else if (ip.indexOf(':') !== -1) { // IPv6 (http://zh.wikipedia.org/wiki/IPv6)
			parts = ip.split(':');
			if (ip.indexOf(':::') !== -1) {
				return false;
			} else if (ip.indexOf('::') !== -1) {
				if (!(ip.split('::').length === 2 || parts.length > 8)) {
					return false;
				}
			} else {
				if (parts.length !== 8) {
					return false;
				}
			}
			if (parts.length === 4 && isV4(parts[3])) {
				return parts[2] === 'ffff';
			} else {
				for (i = 0; i < parts.length; i++) {
					if (!/^[0-9A-Za-z]{0,4}$/.test(parts[i])) {
						return false;
					}
				}
				return !/(^:[^:])|([^:]:$)/g.test(ip);
			}
		} else {
			return false;
		}
	};

	/**
	 * \u4eceURL\u91cc\u627e\u51fa\u53ef\u80fd\u7684\u57df\u540d
	 */
	exports.findHostname = function(url) {
		if (url) {
			url = url.split('/');
			for (var i = 2; i < url.length; i++) {
				if (url[i]) {
					return url[i];
				}
			}
		}
		return '';
	};

	/**
	 * \u6587\u4ef6\u662f\u5426\u5b58\u5728
	 */
	exports.fileExists = util.fileExists;

	/**
	 * \u8def\u5f84\u662f\u5426\u662f\u76ee\u5f55
	 */
	exports.isDirectory = util.isDirectory;

	/**
	 * \u83b7\u53d6\u56fd\u9645\u5316\u6587\u6848
	 */
	exports.i18n = chrome.i18n.getMessage;

});
