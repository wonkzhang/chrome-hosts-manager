/**
 * \u6570\u636e\u6a21\u578b
 */
define(function(require, exports) {

	// \u540e\u53f0\u9875\u6570\u636e\u6a21\u578b
	var model = chrome.extension.getBackgroundPage().model,
	
	// \u5de5\u5177\u96c6
	util = require('../util/util.js'),

	// \u7ed3\u70b9
	Entry = require('./entry.js'),

	/**
	 * \u4f7f\u7528\u4ee3\u7406\u8ba9\u53d8\u66f4\u7acb\u5373\u751f\u6548
	 */
	doProxy = function(array) {
		var script = '', i;
		for (i = 0; i < array.length; i++) {
			script += '}else if(host=="' + array[i].hostname + '"){';
			script += 'return "PROXY ' + array[i].addr + ':80; DIRECT";';
		}
		chrome.proxy.settings.set({
			value: {
				mode: "pac_script",
				pacScript: {
					data: 'function FindProxyForURL(url,host){if(shExpMatch(url,"http:*")){if(isPlainHostName(host)){return "DIRECT";' +
							script + '}else{return "DIRECT";}}else{return "DIRECT";}}'
				}
			},
			scope: 'regular'
		}, $.noop);
	},

	manifest = {};

	// \u52a0\u8f7dmanifest.json\u6587\u4ef6
	$.ajax({
		async: false,
		dataType: 'json',
		success: function(data) {
			manifest = data;
		},
		url: '/manifest.json'
	});

	/**
	 * \u5b58\u50a8\u6570\u636e
	 */
	exports.put = model.put;

	/**
	 * \u83b7\u53d6\u6570\u636e
	 */
	exports.get = model.get;

	/**
	 * \u5220\u9664\u6570\u636e
	 */
	exports.remove = model.remove;

	/**
	 * \u6dfb\u52a0\u7ec4
	 */
	exports.addGroup = function(groupData) {
		var data = model.get('data') || exports.loadData(),
		group = data[groupData.line] || new Entry(groupData.line),
		entry = new Entry();
		data[groupData.line] = group;
		group.enable = false;
		entry.enable = false;
		entry.comment = groupData.comment;
		entry.addr = groupData.addr;
		entry.hostname = groupData.hostname;
		group.link(entry);
	};

	/**
	 * \u4ecehosts\u6587\u4ef6\u52a0\u8f7d\u6570\u636e
	 */
	exports.loadData = function() {
		var file = exports.getHostsPath(),
		content = model.readFile(file),
		data = {},
		i, c, d, entry, group;
		if (content) {
			for (i = 0; i < content.length; i++) { // \u626b\u63cf\u975eutf8\u5b57\u7b26
				c = content.charAt(i);
				if (c == '\ufffc' || c == '\ufffd') {
					data.error = 'unknownChar';
					break;
				}
			}
			content = content.split(/\r?\n/);
			for (i = 0; i < content.length; i++) {
				entry = new Entry();
				if (entry.analysis(content[i])) { // \u662f\u5408\u6cd5\u8bb0\u5f55
					c = group || util.i18n('defaultGroup');
					d = c.charAt(0) == '@' ? c.substring(1) : c;
					data[d] = data[d] || new Entry(c);
					data[d].link(entry);
				} else { // \u662f\u6ce8\u91ca\u6216\u7a7a\u884c
					group = entry.line;
				}
			}
			for (i in data) {
				data[i].checkEnable();
			}
		}
		model.put('data', data);
		return data;
	};

	/**
	 * \u4fdd\u5b58\u6570\u636e\u5230\u6307\u5b9a\u6587\u4ef6
	 */
	exports.saveData = function(file) {
		var data = model.get('data'),
		bm = chrome.benchmarking,
		array = [],
		content = '', i;
		if (bm) {
			for (i in data) {
				content += data[i].toString();
			}
			model.saveFile(file || exports.getHostsPath(), content);
			bm.clearCache();
			bm.clearHostResolverCache();
			bm.clearPredictorCache();
			bm.closeConnections();
		} else {
			for (i in data) {
				content += data[i].toString();
				data[i].pushEnables(array);
			}
			model.saveFile(file || exports.getHostsPath(), content);
			doProxy(array);
		}
	};

	/**
	 * \u8bbe\u7f6ehosts\u6587\u4ef6\u8def\u5f84
	 */
	exports.setHostsPath = function(path) {
		model.put('hostsPath', path);
	};

	/**
	 * \u83b7\u53d6hosts\u6587\u4ef6\u8def\u5f84(\u4f18\u5148\u624b\u52a8\u8bbe\u7f6e\u7684\u503c,\u5176\u6b21\u9ed8\u8ba4\u503c)
	 */
	exports.getHostsPath = function() {
		return model.get('hostsPath') || model.getHostsPath();
	};

	/**
	 * \u83b7\u53d6\u7248\u672c\u53f7
	 */
	exports.getVersion = function() {
		return manifest.version;
	};

});
