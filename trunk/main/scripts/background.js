(function(embed, data) {

	// 数据模型
	window.model = {

		/**
		 * 存储数据
		 */
		put: function(key, value) {
			if (typeof value == 'string') {
				localStorage.setItem(key, value);
			} else {
				data[key] = value;
			}
		},

		/**
		 * 获取数据
		 */
		get: function(key) {
			return data[key] || localStorage.getItem(key);
		},

		/**
		 * 删除数据
		 */
		remove: function(key) {
			delete data[key];
			localStorage.removeItem(key);
		},

		/**
		 * 获取hosts文件路径
		 */
		getHostsPath: function() {
			if (embed.getPlatform() == 'windows') {
				return embed.getSystemPath() + '\\drivers\\etc\\hosts';
			} else {
				return '/etc/hosts';
			}
		},

		/**
		 * 保存文件
		 * @param file
		 * @param content
		 */
		saveFile: function(file, content) {
			embed.saveTextFile(file, content);
		},

		/**
		 * 读取文件
		 * @param file
		 */
		readFile: function(file) {
			return embed.getTextFile(file);
		}
	};

	// 工具集
	window.util = {

		/**
		 * 判断文件是否存在
		 */
		fileExists: function(file) {
			try {
				return embed.fileExists(file);
			} catch (e) {
				return false;
			}
		},

		/**
		 * 判断文件是否是目录
		 */
		isDirectory: function(file) {
			try {
				return embed.isDirectory(file);
			} catch (e) {
				return false;
			}
		}
	};

	// 设置状态的初始值
	var method = model.get('method');
	if (chrome.benchmarking) {
		model.put('benchmarking', '1');
	} else {
		model.put('benchmarking', '0');
		if (method == 'clearCache') {
			method = null;
		}
	}
	model.put('method', method || 'useProxy');
	if (!model.get('showIP')) {
		model.put('showIP', '1');
		chrome.tabs.create({
			url: 'option.html'
		});
	}

	// 获取实际访问的IP放入缓存
	chrome.webRequest.onCompleted.addListener(function(details) {
		data[details.tabId] = details.ip;
		if (model.get('showIP') != '1') {
			return;
		}
		chrome.tabs.executeScript(details.tabId, {
			code: '(function(ip){' +
					'if(ip){' +
						'ip.innerHTML="' + details.ip + '";' +
					'}else{' +
						'ip=document.createElement("div");' +
						'ip.innerHTML="' + details.ip + '";' +
						'ip.id="chrome-hosts-manager-ipaddr";' +
						'ip.title="' + chrome.i18n.getMessage('currentTabIP') +
								chrome.i18n.getMessage('clickToHide') + '";' +
						'document.body.appendChild(ip);' +
						'ip.addEventListener("click",function(){' +
							'ip.parentNode.removeChild(ip);' +
						'});' +
					'}' +
				'})(document.getElementById("chrome-hosts-manager-ipaddr"))'
		});
		chrome.tabs.insertCSS(details.tabId, {
			file: '/styles/inject.css'
		});
	}, {
		urls: [ 'http://*/*', 'https://*/*' ],
		types: [ 'main_frame' ]
	});

	// 关闭tab时消除缓存
	chrome.tabs.onRemoved.addListener(function(tabId) {
		delete data[tabId];
	});
})((function() {
	var embed = document.createElement('embed');
	embed.type = 'application/x-npapi-file-io';
	document.getElementsByTagName('body')[0].appendChild(embed);
	return embed;
})(), {});