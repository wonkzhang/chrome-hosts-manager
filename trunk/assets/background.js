var background = (function(trim, push, iohelper, iphelper, cache) {
	var IP = function() {
		var that = this;
		that.addr = '';
		that.comment = '';
		that.enable = false;
		that.group = '';
		that.hostname = '';
		that.hash = function() {
			return that.hostname;
		};
		that.each = function(hosts, callback) {
			if (hosts && hosts.length) {
				for (var i = 0; i < hosts.length; i++) {
					var ip = new IP();
					ip.addr = that.addr;
					ip.comment = that.comment;
					ip.enable = that.enable;
					ip.group = that.group;
					ip.hostname = hosts[i];
					callback && callback.call(ip);
				}
			}
		};
	},
	file = iohelper.getPlatform() === 'windows' ? iohelper.getSystemPath() + '\\drivers\\etc\\hosts' : '/etc/hosts';
	try {
		iphelper.SetExtName(chrome.extension.getURL('').split('chrome-extension://')[1].split('/')[0] + '\\1.4');
	} catch (e) {
	}
	return {
		get : function() {
			var regQute = /^#+/,
			time = new Date(),
			groups = {},
			hosts = {},
			content, contents, past;
			if (cache && time - cache.time < 10000) {
				return cache;
			}
			content = iohelper.getTextFile(file);
			contents = content.split(/\r?\n/);
			for (var i = 0; i < contents.length; i++) {
				var line = trim(contents[i]);
				if (!localStorage.getItem('show_tip') && !/^[\w\s\.\-\0#]*$/.test(line)) {
					localStorage.setItem('show_tip', 1);
				}
				if (/^#*\s*\d{1,3}(\.\d{1,3}){3}\s+[^#]+/.test(line)) {
					var ip = new IP(), index;
					ip.enable = !regQute.test(line);
					line = trim(line.replace(regQute, ''));
					index = line.indexOf('#');
					if (index !== -1) {
						ip.comment = trim(line.substring(index).replace(regQute, ''));
						line = trim(line.substring(0, index));
					}
					line = line.split(/\s+/);
					ip.addr = line[0];
					index = /^#+\s*\S+/.test(past) ? trim(past.replace(regQute, '')) : 'DEFAULT';
					ip.each(line.slice(1), function() {
						this.group = index;
						push(groups, index, this);
						push(hosts, this.hostname, index);
					});
				} else {
					past = line;
				}
			}
			cache = {
				groups : groups,
				hosts : hosts,
				file : file,
				time : time
			};
			setTimeout(function() {
				iohelper.saveTextFile(file + '.auto.bak', content);
			}, 0);
			return cache;
		},
		set : function(groups, backup) {
			var content = '';
			for (var group in groups) {
				content += '\n# ' + group + '\n';
				group = groups[group];
				for (var ip in group) {
					ip = group[ip];
					content += (ip.enable ? '' : '#') + ip.addr + '\t' + ip.hostname + (ip.comment ? '\t# ' + ip.comment : '') + '\n';
				}
			}
			cache = null;
			return iohelper.saveTextFile(backup ? file + '.bak' : file, content);
		},
		info : function(url) {
			try {
				return iphelper.GetURLData(url).split('|').slice(0, 2).join('|');
			} catch (e) {
			}
		},
		storage : localStorage
	};
})(function(str) {
	return str && str.replace ? str.replace(/^\s+|\s+$/g, '') : str;
}, function(obj, key, value) {
	if (typeof value === 'string' || value && value.hash) {
		var hash = value && value.hash ? value.hash() : value;
		obj[key] = obj[key] || {};
		obj[key][hash] = value;
	} else {
		obj[key] = obj[key] || [];
		obj[key].push(value);
	}
}, document.getElementById('file_io'), document.getElementById('ip_2_country'));
