/**
 * 视图逻辑
 */
define(function(require, exports) {
	'require:nomunge,exports:nomunge,module:nomunge';

	// 业务逻辑
	var biz = require('./biz.js'),
	
	// 工具集
	util = require('../util/util.js'),
	
	// 弹出消息
	tip = require('../util/tip.js'),

	// 编辑层
	editor = require('../util/editor.js'),

	// 渲染器
	Render = require('../model/render.js'),

	// 组结点渲染器
	groupRender = new Render('groupTemp'),

	// 行结点渲染器
	lineRender = new Render('lineTemp'),

	// 头渲染器
	headRender = new Render('headTemp'),

	// 过滤非当前URL的标记
	isCurrent = false,

	/**
	 * 保存文件
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
	 * 组筛选初始化
	 */
	groupFilterInit = function(projs) {
		var select, i;
		if (!$.isEmptyObject(projs)) {
			select = $('select');
			if (select.length == 0) {
				select = $('<select>');
				select.change(function() {
					isCurrent = false;
					if (this.selectedIndex) {
						var text = this.options[this.selectedIndex].text,
						data = biz.loadData();
						for (var i in data) {
							if (i.indexOf('==@') != -1
									&& i.split('==@')[1].indexOf(text) != -1) {
								data[i].target.closest('.block').removeClass('hidden');
							} else {
								data[i].target.closest('.block').addClass('hidden');
							}
						}
					} else {
						$('#content .hidden').removeClass('hidden');
					}
				});
				$('#groupFilter').html(select);
			}
			select.html('<option>' + util.i18n('allProjects') + '</option>');
			for (i in projs) {
				select.append('<option>' + i + '</option>');
			}
		} else {
			$('#groupFilter').html(util.i18n('groupFilter'));
		}
	},

	/**
	 * 批量启用/禁用
	 */
	batchCheck = function(enables, disables) {
		if (saveData()) {
			enables && enables.trigger('checkon');
			disables && disables.trigger('checkoff');
		}
	};

	/**
	 * 切换启用/禁用按钮
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
	 * 添加组
	 */
	exports.addGroup = function(target, line) {
		var fields = biz.editFields({
			addr: '127.0.0.1',
			hostname: '',
			comment: ''
		});
		if (!line) { // 新组
			fields = biz.editFields({
				line: line || util.i18n('newGroup')
			}).concat(fields);
		}
		editor.show(target.data('title'), fields, function(err, data) {
			if (err) { // 输入校验
				tip.showErrorTip(err);
			} else {
				if (line) { // 新项已有所属组
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
	 * 添加行
	 */
	exports.addLine = function(target) {
		var node = target.closest('.node'),
		line = node.data('target').line;
		exports.addGroup(target, line);
	};

	/**
	 * 编辑按钮
	 */
	exports.edit = function(target) {
		var data = target.closest('.node').data('target'),
		fields = biz.editFields(data);
		editor.show(target.data('title'), fields, function(err, nData) {
			if (err) { // 输入校验
				tip.showErrorTip(err);
			} else {
				var render = data.addr ? lineRender : groupRender,
				node = null;
				for (var i in nData) { // 新值覆盖
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
	 * 删除按钮
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
	 * 展开/收缩按钮
	 */
	exports.expand = function(target) {
		if (!target.hasClass('lock')) {
			target.addClass('lock');
			var group = target.closest('.group'),
			collapse = target.hasClass('collapse');
			group.data('target').hide = collapse;
			if (saveData()) {
				if (collapse) { // 收缩已经展开的
					group.next().slideUp(function() {
						target.removeClass('collapse lock').addClass('expand');
					});
				} else { // 展开已经收缩的
					group.next().slideDown(function() {
						target.removeClass('expand lock').addClass('collapse');
					});
				}
			}
		}
	};

	/**
	 * 链接按钮
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
	 * 渲染头
	 */
	exports.renderHead = function() {
		$('#content').before(headRender.render({
			version: biz.getVersion(),
			hostsPath: biz.getHostsPath()
		}));
	};

	/**
	 * 刷新数据
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
				projs = {},
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
					if (i.indexOf('==@') != -1) {
						projs[$.trim(i.split('==@')[1])] = true;
					}
				}
				content.append(blocks);
				groupFilterInit(projs);
				if (refresh !== false) {
					tip.showInfoTip(util.i18n('loadSuccess'));
				}
			} catch (e) {
				tip.showErrorTip(util.i18n('cantReadFile'));
			}
		}
	};

	/**
	 * 备份数据
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
	 * 滚动阴影效果
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
	 * 显示当前路径的绑定
	 */
	exports.current = function() {
		if (isCurrent) {
			$('#content .hidden').removeClass('hidden');
			isCurrent = false;
		} else {
			util.getCurrentTab(function(tab) {
				var hostname = util.findHostname(tab.url);
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
			});
		}
	};

	/**
	 * 编辑取消
	 */
	exports.olCancel = function() {
		editor.hide();
		exports.close();
	};

	/**
	 * 显示当前tab的IP
	 */
	exports.showCurrentIP = function() {
		util.getCurrentTab(function(tab) {
			var ip = biz.getIP(tab.id);
			ip && $('#currentIP').html(util.i18n('currentTabIP') + ip);
		});
	};

	/**
	 * 导入多行hosts数据
	 */
	exports.imports = function(target) {
		var node = target.closest('.node');
		editor.show(target.data('title'), [{
			label: target.data('title'),
			name: 'imports',
			type: 'textarea'
		}], function(err, data) {
			var fragment = $.trim(data.imports) || '';
			if (fragment) {
				if (node.hasClass('group')) {
					biz.parseData(fragment, null, node.data('target').line);
				} else {
					biz.parseData(fragment);
				}
				saveData();
				exports.refresh(false);
			}
			editor.hide();
		});
	};

	/**
	 * 编辑保存
	 */
	exports.olSave = editor.save;

	/**
	 * 按钮文字提示
	 */
	exports.showTip = tip.showTip;

	/**
	 * 确认提示
	 */
	exports.confirm = tip.confirm;

	/**
	 * 关闭提示
	 */
	exports.close = tip.close;

});
