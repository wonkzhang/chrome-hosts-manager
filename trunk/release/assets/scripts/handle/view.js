/**
 * \u89c6\u56fe\u903b\u8f91
 */
define(function(require, exports) {

	// \u4e1a\u52a1\u903b\u8f91
	var biz = require('./biz.js'),
	
	// \u5de5\u5177\u96c6
	util = require('../util/util.js'),
	
	// \u5f39\u51fa\u6d88\u606f
	tip = require('../util/tip.js'),

	// \u7f16\u8f91\u5c42
	editor = require('../util/editor.js'),

	// \u6e32\u67d3\u5668
	Render = require('../model/render.js'),

	// \u7ec4\u7ed3\u70b9\u6e32\u67d3\u5668
	groupRender = new Render('groupTemp'),

	// \u884c\u7ed3\u70b9\u6e32\u67d3\u5668
	lineRender = new Render('lineTemp'),

	// \u5934\u6e32\u67d3\u5668
	headRender = new Render('headTemp'),

	// \u8fc7\u6ee4\u975e\u5f53\u524dURL\u7684\u6807\u8bb0
	isCurrent = false,

	/**
	 * \u4fdd\u5b58\u6587\u4ef6
	 */
	saveData = function(file) {
		try {
			biz.saveData(file);
			file && setTimeout(function() {
				tip.showInfoTip(util.i18n('saveSuccess'));
			}, 0);
			return true;
		} catch (e) {
			tip.showErrorTip(util.i18n('cantWriteFile'));
			return false;
		}
	},

	/**
	 * \u6279\u91cf\u542f\u7528/\u7981\u7528
	 */
	batchCheck = function(enables, disables) {
		if (saveData()) {
			enables && enables.trigger('checkon');
			disables && disables.trigger('checkoff');
		}
	};

	/**
	 * \u5207\u6362\u542f\u7528/\u7981\u7528\u6309\u94ae
	 */
	exports.check = function(target) {
		var node = target.closest('.node');
		if (node.hasClass('group')) {
			try {
				biz.checkGroup(node, batchCheck);
			} catch (e) {
				tip.showErrorTip(util.i18n('duplicates'));
			}
		} else {
			biz.checkLine(node, batchCheck);
		}
	};

	/**
	 * \u6dfb\u52a0\u7ec4
	 */
	exports.addGroup = function(target, line) {
		var fields = biz.editFields({
			addr: '127.0.0.1',
			hostname: '',
			comment: ''
		});
		if (!line) { // \u65b0\u7ec4
			fields = biz.editFields({
				line: line || util.i18n('newGroup')
			}).concat(fields);
		}
		editor.show(target.data('title'), fields, function(err, data) {
			if (err) { // \u8f93\u5165\u6821\u9a8c
				tip.showErrorTip(err);
			} else {
				if (line) { // \u65b0\u9879\u5df2\u6709\u6240\u5c5e\u7ec4
					data.line = line;
				}
				biz.addGroup(data);
				saveData();
				setTimeout(function() {
					exports.refresh(false);
				}, 0);
				editor.hide();
			}
		});
	};

	/**
	 * \u6dfb\u52a0\u884c
	 */
	exports.addLine = function(target) {
		var node = target.closest('.node'),
		line = node.data('target').line;
		exports.addGroup(target, line);
	};

	/**
	 * \u7f16\u8f91\u6309\u94ae
	 */
	exports.edit = function(target) {
		var data = target.closest('.node').data('target'),
		fields = biz.editFields(data);
		editor.show(target.data('title'), fields, function(err, nData) {
			if (err) { // \u8f93\u5165\u6821\u9a8c
				tip.showErrorTip(err);
			} else {
				var render = data.addr ? lineRender : groupRender,
				node = null;
				for (var i in nData) { // \u65b0\u503c\u8986\u76d6
					data[i] = nData[i];
				}
				node = $(render.render(data));
				data.target.replaceWith(node);
				data.setTarget(node);
				saveData() && editor.hide();
			}
		});
	};

	/**
	 * \u5220\u9664\u6309\u94ae
	 */
	exports.remove = function(target) {
		tip.showInfoTip(target.data('title') + '?', function() {
			var data = target.closest('.node').data('target');
			if (!data.addr) {
				delete biz.loadData()[data.line];
			}
			data.delink();
			saveData();
			target.trigger('remove');
		});
	};

	/**
	 * \u5c55\u5f00/\u6536\u7f29\u6309\u94ae
	 */
	exports.expand = function(target) {
		if (!target.hasClass('lock')) {
			target.addClass('lock');
			var group = target.closest('.group'),
			collapse = target.hasClass('collapse');
			group.data('target').hide = collapse;
			if (saveData()) {
				if (collapse) { // \u6536\u7f29\u5df2\u7ecf\u5c55\u5f00\u7684
					group.next().slideUp(function() {
						target.removeClass('collapse lock').addClass('expand');
					});
				} else { // \u5c55\u5f00\u5df2\u7ecf\u6536\u7f29\u7684
					group.next().slideDown(function() {
						target.removeClass('expand lock').addClass('collapse');
					});
				}
			}
		}
	};

	/**
	 * \u94fe\u63a5\u6309\u94ae
	 */
	exports.link = function() {
		var val = $('#hostsPath').val();
		if (!val) {
			tip.showErrorTip(util.i18n('blankPath'));
		} else if (!util.fileExists(val)) {
			tip.showErrorTip(util.i18n('fileNotExist'));
		} else if (util.isDirectory(val)) {
			tip.showErrorTip(util.i18n('noDirectory'));
		} else {
			chrome.tabs.create({
				url : 'file:///' + val.replace(/\\/g, '/')
			});
		}
	};

	/**
	 * \u6e32\u67d3\u5934
	 */
	exports.renderHead = function() {
		$('#content').before(headRender.render({
			version: biz.getVersion(),
			hostsPath: biz.getHostsPath()
		}));
	};

	/**
	 * \u5237\u65b0\u6570\u636e
	 */
	exports.refresh = function(refresh) {
		var val = $('#hostsPath').val();
		if (!val) {
			tip.showErrorTip(util.i18n('blankPath'));
		} else if (!util.fileExists(val)) {
			tip.showErrorTip(util.i18n('fileNotExist'));
		} else if (util.isDirectory(val)) {
			tip.showErrorTip(util.i18n('noDirectory'));
		} else {
			try {
				biz.setHostsPath(val);
				var data = biz.loadData(true),
				content = $('#content').html(''),
				blocks = $('<ul class="blocks clearfix"></ul>'),
				block, lines, i;
				if (data.error) {
					tip.showErrorTip(util.i18n(data.error));
					delete data.error;
				}
				for (i in data) {
					block = $('<li class="block"></li>').appendTo(blocks);
					data[i].setTarget($(groupRender.render(data[i])).appendTo(block));
					lines = $('<ul>').appendTo(block);
					data[i].hide && lines.hide();
					data[i].traverse(function() {
						this.setTarget($(lineRender.render(this)).appendTo(lines));
					});
				}
				content.append(blocks);
				if (refresh !== false) {
					tip.showInfoTip(util.i18n('loadSuccess'));
				}
			} catch (e) {
				tip.showErrorTip(util.i18n('cantReadFile'));
			}
		}
	};

	/**
	 * \u5907\u4efd\u6570\u636e
	 */
	exports.backup = function() {
		editor.show(util.i18n('backupPath'), [ {
			label: '{{:backupPath}}',
			name: 'path',
			value: $('#hostsPath').val()
		} ], function(err, data) {
			if (!data.path) {
				tip.showErrorTip(util.i18n('blankPath'));
			} else if (util.fileExists(data.path)) {
				tip.showInfoTip(util.i18n('overwrite'), function() {
					saveData(data.path);
					editor.hide();
				});
			} else if (util.isDirectory(data.path)) {
				tip.showErrorTip(util.i18n('noDirectory'));
			} else {
				saveData(data.path) && editor.hide();
			}
		});
	};

	/**
	 * \u6eda\u52a8\u9634\u5f71\u6548\u679c
	 */
	exports.scroll = function(target) {
		clearTimeout(target.data('timeout'));
		target.data('timeout', setTimeout(function() {
			target.removeClass('scroll-top scroll-bottom');
		}, 1000));
		if (target.scrollTop() < target.data('scroll')) { // top
			target.addClass('scroll-bottom').removeClass('scroll-top');
		} else if (target.scrollTop() > target.data('scroll')) { // bottom
			target.addClass('scroll-top').removeClass('scroll-bottom');
		}
		target.data('scroll', target.scrollTop());
	};

	/**
	 * \u663e\u793a\u5f53\u524d\u8def\u5f84\u7684\u7ed1\u5b9a
	 */
	exports.current = function() {
		if (isCurrent) {
			$('#content .hidden').removeClass('hidden');
			isCurrent = false;
		} else {
			chrome.tabs.query({
				windowId: chrome.windows.WINDOW_ID_CURRENT,
				active: true
			}, function(tabs) {
				if (tabs && tabs[0]) {
					var hostname = util.findHostname(tabs[0].url);
					if (hostname) {
						var data = biz.loadData(),
						i, sum, toHide;
						for (i in data) {
							toHide = $();
							sum = data[i].traverse(function() {
								if (this.hostname != hostname) {
									toHide = toHide.add(this.target);
								}
							});
							if (sum == toHide.length) {
								data[i].target.closest('.block').addClass('hidden');
							} else {
								toHide.addClass('hidden');
							}
						}
						isCurrent = true;
						data = null;
					}
				}
			});
		}
	};

	/**
	 * \u7f16\u8f91\u53d6\u6d88
	 */
	exports.olCancel = function() {
		editor.hide();
		exports.close();
	};

	/**
	 * \u663e\u793a\u521d\u59cb\u5316\u7684\u5efa\u8bae\u4fe1\u606f
	 */
	exports.initInfoTip = function() {
		if (!chrome.benchmarking) {
			tip.showInfoTip(util.i18n('recommendInfo'));
		}
	};

	/**
	 * \u7f16\u8f91\u4fdd\u5b58
	 */
	exports.olSave = editor.save;

	/**
	 * \u6309\u94ae\u6587\u5b57\u63d0\u793a
	 */
	exports.showTip = tip.showTip;

	/**
	 * \u786e\u8ba4\u63d0\u793a
	 */
	exports.confirm = tip.confirm;

	/**
	 * \u5173\u95ed\u63d0\u793a
	 */
	exports.close = tip.close;

});
