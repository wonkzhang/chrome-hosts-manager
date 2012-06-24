/**
 * \u7ed3\u70b9
 */
define(function(require, exports, module) {

	// \u6ce8\u91ca\u7684\u6b63\u5219
	var regQute = /^#+\s*/,

	// \u5de5\u5177\u7c7b
	util = require('../util/util.js'),

	/**
	 * \u6784\u9020\u65b9\u6cd5
	 */
	Entry = function(line) {
		this.addr = ''; // IP
		this.comment = ''; // \u6ce8\u91ca
		this.enable = false; // \u662f\u5426\u542f\u7528
		this.hostname = ''; // \u57df\u540d
		this.line = line; // hosts\u6587\u4ef6\u4e2d\u5bf9\u5e94\u7684\u884c
		this.next = this; // \u4e0b\u4e00\u6761\u8bb0\u5f55
		this.target = null; // \u5bf9\u5e94\u7684DOM
		this.hide = false; // \u662f\u5426\u9690\u85cf(\u53ea\u5bf9\u7ec4\u6709\u6548)
		if (line && line.charAt(0) == '@') {
			this.hide = true;
			this.line = line.substring(1);
		}
	};

	Entry.prototype = {

		/**
		 * \u4ece\u5f53\u524d\u7ed3\u70b9\u7684\u4e0b\u4e00\u4e2a\u5f00\u59cb\u904d\u5386, \u8fd4\u56de\u904d\u5386\u5230\u7684\u7ed3\u70b9\u4e2a\u6570
		 */
		traverse: function(callback) {
			var c = 0, p = this.next, q;
			while (p != this) {
				c++;
				q = p.next;
				if (callback && callback.call(p) === false) {
					return c;
				}
				p = q;
			}
			return c;
		},

		/**
		 * \u5b9a\u4f4d\u5230\u7ec4\u7ed3\u70b9
		 */
		findGroup: function() {
			var group = null;
			this.traverse(function() {
				if (!this.addr) {
					group = this;
					return false;
				}
			});
			return group;
		},

		/**
		 * \u8bbe\u7f6e\u76ee\u6807\u7ed3\u70b9
		 */
		setTarget: function(target) {
			if (target && (target instanceof $)) {
				this.target = target;
				target.data('target', this);
			}
		},

		/**
		 * \u68c0\u67e5\u662f\u5426\u542f\u7528
		 */
		checkEnable: function() {
			var that = this;
			if (!this.addr) {
				this.enable = true;
				this.traverse(function() {
					if (!this.enable) {
						that.enable = false;
						return false;
					}
				});
			}
			return this.enable;
		},

		/**
		 * \u94fe\u63a5
		 */
		link: function(entry) {
			var p = entry;
			while (p.next != entry) {
				p = p.next;
			}
			p.next = this.next;
			this.next = entry;
		},

		/**
		 * \u65ad\u5f00\u94fe\u63a5
		 */
		delink: function() {
			var p;
			if (this.addr) { // \u884c
				this.traverse(function() {
					p = this;
				});
				if (p) { // \u524d\u4e00\u4e2a\u7ed3\u70b9
					p.next = this.next;
				}
			} else { // \u7ec4
				this.traverse(function() {
					this.next = null;
					this.target = null;
				});
			}
			this.next = null;
			this.target = null;
		},

		/**
		 * \u89e3\u6790
		 */
		analysis: function(line) {
			var regQute = /^#+/;
			line = $.trim(line);
			if (/^#*\s*[0-9A-Za-z:\.]+\s+[^#]+/.test(line)) {
				this.enable = !regQute.test(line); // \u662f\u5426\u542f\u7528
				if (!this.enable) {
					line = line.replace(regQute, '');
				}
				var index = line.indexOf('#');
				if (index != -1) {
					this.comment = $.trim(line.substring(index).replace(regQute, '')); // \u6ce8\u91ca
					line = $.trim(line.substring(0, index));
				}
				line = line.split(/\s+/);
				if (line.length > 1 && util.isValidIP(line[0])) { // \u662f\u5408\u6cd5\u7684IP\u5730\u5740
					this.addr = line[0];
					this.hostname = line[1];
					for (var i = 2; i < line.length; i++) { // \u4e00\u4e2aIP\u5bf9\u5e94\u591a\u4e2a\u57df\u540d
						var entry = new Entry();
						entry.addr = this.addr;
						entry.comment = this.comment;
						entry.enable = this.enable;
						entry.hostname = line[i];
						this.link(entry);
					}
					return true;
				}
			}
			if (line instanceof Array) {
				line = line.join(' ');
			}
			this.line = $.trim(line.replace(regQute, ''));
			return false;
		},

		/**
		 * \u8fd8\u539f\u4e3a\u6587\u5b57
		 */
		toString: function() {
			var text = '';
			if (this.addr) { // \u884c
				text += (this.enable ? '' : '#') + this.addr + '\t' + this.hostname;
				text += (this.comment ? '\t# ' + this.comment : '') + '\n';
			} else { // \u7ec4(\u8f93\u51fa\u7ec4\u5185\u6240\u6709\u884c)
				text += '\n# ' + (this.hide ? '@' : '') + this.line + '\n';
				this.traverse(function() {
					text += this.toString();
				});
			}
			return text;
		},

		/**
		 * \u5c06\u542f\u7528\u9879\u63a8\u5230\u6570\u7ec4\u4e2d
		 * @param array
		 */
		pushEnables: function(array) {
			if (this.addr) {
				if (this.enable) {
					array.push({
						addr: this.addr,
						hostname: this.hostname
					});
				}
			} else {
				this.traverse(function() {
					this.pushEnables(array);
				});
			}
		}
	};

	module.exports = Entry;

});
