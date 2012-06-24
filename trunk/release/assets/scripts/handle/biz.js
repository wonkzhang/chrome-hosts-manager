/**
 * \u4e1a\u52a1\u903b\u8f91
 */
define(function(require, exports) {

	// \u540e\u53f0\u9875\u6570\u636e\u6a21\u578b
	var model = require('../model/model.js'),

	/**
	 * \u7981\u7528\u6389\u96c6\u5408\u4e2d\u7684\u57df\u540d, \u8fd4\u56de\u7981\u7528\u7ed3\u70b9\u96c6\u5408(\u6307\u5b9agroup\u6216entry\u7684\u9664\u5916)
	 */
	disableAll = function(hostnames, group, entry) {
		var data = exports.loadData(),
		disables = $(), did, i;
		for (i in data) {
			if (data[i] != group) {
				did = false;
				data[i].traverse(function() {
					if (this != entry && this.enable && hostnames[this.hostname]) {
						this.enable = false;
						disables = disables.add(this.target);
						did = true;
					}
				});
				if (did) {
					data[i].enable = false;
					disables = disables.add(data[i].target);
				}
			}
		}
		hostnames = group = entry = data = null;
		return disables;
	};

	/**
	 * \u5207\u6362\u7ec4\u542f\u7528\u72b6\u6001
	 */
	exports.checkGroup = function(node, callback) {
		var entry = node.data('target');
		if (entry.enable) { // \u542f\u7528\u7684\u7ec4\u5207\u6362\u4e3a\u7981\u7528
			entry.traverse(function() {
				if (this.enable) {
					this.enable = false;
					node = node.add(this.target);
				}
			});
			entry.enable = false;
			callback(null, node);
			entry = node = null;
		} else { // \u7981\u7528\u7684\u7ec4\u5207\u6362\u4e3a\u542f\u7528
			var hostnames = {},
			duplicate = false,
			disables = null,
			enables = entry.target;
			entry.traverse(function() { // \u5bfb\u627e\u7ec4\u5185\u662f\u5426\u6709\u91cd\u590dhostname
				if (hostnames[this.hostname]) {
					duplicate = true;
					return false;
				} else {
					hostnames[this.hostname] = true;
				}
			});
			if (duplicate) {
				throw 1;
			}
			disables = disableAll(hostnames, entry); // \u7981\u7528\u5176\u4ed6\u7ec4\u5185\u548c\u672c\u7ec4\u6709\u91cd\u590d\u7684hostname
			entry.traverse(function() {
				if (!this.enable) {
					this.enable = true;
					enables = enables.add(this.target);
				}
			});
			entry.enable = true;
			callback(enables, disables);
			entry = node = hostnames = disables = enables = null;
		}
	};

	/**
	 * \u5207\u6362\u884c\u542f\u7528\u72b6\u6001
	 */
	exports.checkLine = function(node, callback) {
		var entry = node.data('target'),
		group = entry.findGroup(),
		hostnames = {},
		enables = null;
		if (entry.enable) {
			entry.enable = false;
			group.enable = false;
			callback(null, entry.target.add(group.target));
		} else {
			hostnames[entry.hostname] = true;
			entry.enable = true;
			enables = group.checkEnable() ? group.target.add(entry.target) : entry.target;
			callback(enables, disableAll(hostnames, null, entry));
		}
	};

	/**
	 * \u52a0\u8f7d\u6570\u636e
	 */
	exports.loadData = function(noCache) {
		if (noCache || !model.get('data')) {
			return model.loadData();
		} else {
			return model.get('data');
		}
	};

	/**
	 * \u83b7\u53d6\u9700\u8981\u7f16\u8f91\u7684\u8868\u5355\u9879
	 */
	exports.editFields = function(data) {
		var fields = [];
		if (data.addr) { // \u884c
			fields.push({
				label: '{{:olAddr}}',
				name: 'addr',
				value: data.addr,
				check: 'isValidIP'
			});
			fields.push({
				label: '{{:olHost}}',
				name: 'hostname',
				value: data.hostname,
				check: /^[\w\.\-]+$/
			});
			fields.push({
				label: '{{:olComment}}',
				name: 'comment',
				value: data.comment,
				check: /^[^#]*$/
			});
		} else { // \u7ec4
			fields.push({
				label: '{{:olGroup}}',
				name: 'line',
				value: data.line,
				check: /^[^@][^#]*$/
			});
		}
		return fields;
	};

	/**
	 * \u6dfb\u52a0\u7ec4
	 */
	exports.addGroup = model.addGroup;

	/**
	 * \u4fdd\u5b58\u6570\u636e
	 */
	exports.saveData = model.saveData;

	/**
	 * \u83b7\u53d6\u7248\u672c\u53f7
	 */
	exports.getVersion = model.getVersion;

	/**
	 * \u83b7\u53d6hosts\u6587\u4ef6\u8def\u5f84
	 */
	exports.getHostsPath = model.getHostsPath;

	/**
	 * \u8bbe\u7f6ehosts\u6587\u4ef6\u8def\u5f84
	 */
	exports.setHostsPath = model.setHostsPath;

});
