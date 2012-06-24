(function(embed, data) {

	// \u6570\u636e\u6a21\u578b
	window.model = {

		/**
		 * \u5b58\u50a8\u6570\u636e
		 */
		put: function(key, value) {
			if (typeof value == 'string') {
				localStorage.setItem(key, value);
			} else {
				data[key] = value;
			}
		},

		/**
		 * \u83b7\u53d6\u6570\u636e
		 */
		get: function(key) {
			return data[key] || localStorage.getItem(key);
		},

		/**
		 * \u5220\u9664\u6570\u636e
		 */
		remove: function(key) {
			delete data[key];
			localStorage.removeItem(key);
		},

		/**
		 * \u83b7\u53d6hosts\u6587\u4ef6\u8def\u5f84
		 */
		getHostsPath: function() {
			if (embed.getPlatform() == 'windows') {
				return embed.getSystemPath() + '\\drivers\\etc\\hosts';
			} else {
				return '/etc/hosts';
			}
		},

		/**
		 * \u4fdd\u5b58\u6587\u4ef6
		 * @param file
		 * @param content
		 */
		saveFile: function(file, content) {
			embed.saveTextFile(file, content);
		},

		/**
		 * \u8bfb\u53d6\u6587\u4ef6
		 * @param file
		 */
		readFile: function(file) {
			return embed.getTextFile(file);
		}
	};

	// \u5de5\u5177\u96c6
	window.util = {

		/**
		 * \u5224\u65ad\u6587\u4ef6\u662f\u5426\u5b58\u5728
		 */
		fileExists: function(file) {
			try {
				return embed.fileExists(file);
			} catch (e) {
				return false;
			}
		},

		/**
		 * \u5224\u65ad\u6587\u4ef6\u662f\u5426\u662f\u76ee\u5f55
		 */
		isDirectory: function(file) {
			try {
				return embed.isDirectory(file);
			} catch (e) {
				return false;
			}
		}
	};

})((function() {
	var embed = document.createElement('embed');
	embed.type = 'application/x-npapi-file-io';
	document.getElementsByTagName('body')[0].appendChild(embed);
	return embed;
})(), {});
