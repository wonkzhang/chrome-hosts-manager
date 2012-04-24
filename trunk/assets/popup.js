$(function() {
	var background = chrome.extension.getBackgroundPage().background,
	data = background.get(),
	storage = background.storage,
	enable = function(ip) {
		if (!ip.enable) {
			$.each(data.hosts[ip.hostname], function() {
				this !== ip.group && (data.groups[this][ip.hostname].enable = false);
			});
			ip.enable = true;
		}
	},
	save = function() {
		background.set(data.groups);
		data = background.get();
		redraw();
	},
	table = $('#page table').click(function(evt) {
		var tr = $(evt.target).closest('tr'),
		group = tr.data('group'),
		ip = tr.data('ip');
		if (group) {
			if (tr.find('.checked').length) {
				$.each(data.groups[group], function() {
					this.enable = false;
				});
			} else {
				$.each(data.groups[group], function() {
					enable(this);
				});
			}
			save();
		} else if (ip) {
			ip.enable = !ip.enable;
			save();
		}
	})[0],
	checkbox = '<div class="checkbox"></div>',
	checked = '<div class="checkbox checked"></div>',
	editing = null,
	redraw = function(key, row, cell, group, firstCell, enable, ip) {
		if (isEmptyObj(data.hosts)) {
			table.innerHTML = '<tr class="nodata"><td>You can add a host below.</td></tr>';
			$('#addBtn').trigger({
				type: 'click',
				auto: true
			});
		} else {
			table.className = 'hidden';
			table.innerHTML = '';
			for (key in data.groups) {
				if (!storage.getItem('hide_default') && key === 'DEFAULT' || key !== 'DEFAULT') {
					row = table.insertRow(table.rows.length);
					$(row).data('group', key);
					cell = row.insertCell(row.cells.length);
					cell.colSpan = 3;
					cell.className = 'group';
					group = data.groups[key];
					firstCell = cell;
					enable = true;
					for (ip in group) {
						ip = group[ip];
						row = table.insertRow(table.rows.length);
						$(row).data('ip', ip);
						ip.enable && (row.className = 'enable');
						cell = row.insertCell(row.cells.length);
						cell.innerHTML = ip.addr;
						cell = row.insertCell(row.cells.length);
						if (ip.hostname.length > 30) {
							cell.innerHTML = ip.hostname.substring(0, 30) + '...';
							cell.title = ip.hostname;
						} else {
							cell.innerHTML = ip.hostname;
						}
						cell.innerHTML += ip.comment ? ' (' + ip.comment + ')' : '';
						!ip.enable && (enable = false);
					}
					firstCell.innerHTML = enable ? (checked + key) : (checkbox + key);
				}
			}
			if (showCurrent.children('.checkbox').hasClass('checked')) {
				filter(function() {
					table.className = '';
				});
			} else {
				table.className = '';
			}
		}
	},
	showTip = function(msg) {
		var tempTip = $('#tempTip').text(msg).removeClass('hidden');
		tempTip.offset({
			top : (body.height() - tempTip.height()) / 2,
			left : (body.width() - tempTip.outerWidth()) / 2
		}).removeClass('transparent');
		setTimeout(function() {
			tempTip.addClass('transparent');
			setTimeout(function() {
				tempTip.addClass('hidden');
			}, 400);
		}, 4000);
	},
	getCurrentTab = function(callback) {
		chrome.windows.getCurrent(function(win) {
			chrome.tabs.query({
				active : true,
				windowType : 'normal',
				windowId : win.id
			}, function(tabs) {
				tabs && tabs[0] && $.isFunction(callback) && callback(tabs[0]);
			});
		});
	},
	filter = function(callback) {
		getCurrentTab(function(tab) {
			var hostname = tab.url.split('/'),
			hiddenLines = [],
			pastGroup, match, trLen;
			if (hostname && hostname[0] && !hostname[0].indexOf('http')) {
				hostname = hostname[2] && hostname[2].split(':')[0];
				if (hostname) {
					trLen = $('#page table tr').each(function() {
						var tr = $(this),
						group = tr.data('group'),
						ip = tr.data('ip');
						if (group) {
							!match && pastGroup && hiddenLines.push(pastGroup);
							pastGroup = tr;
							match = false;
						} else if (ip) {
							if (ip.hostname !== hostname) {
								hiddenLines.push(tr);
							} else {
								match = true;
							}
						}
					}).length;
					!match && hiddenLines.push(pastGroup);
				}
			}
			if (hiddenLines.length && hiddenLines.length !== trLen) {
				$.each(hiddenLines, function() {
					this.addClass('hidden');
				});
				$.isFunction(callback) && callback();
			} else {
				showTip('No matching items.');
			}
		});
	},
	body = $('body'),
	tip = $('#tip'),
	showCurrent = $('#showCurrent'),
	isEmptyObj = function(obj) {
		for (var key in obj) {
			return false;
		}
		return true;
	};
	$('#page').mouseup(function(evt) {
		if (evt.button === 2) {
			var target = $(evt.target).closest('tr');
			if (target.length && !target.hasClass('nodata')) {
				$('#menu').removeClass('hidden').offset({
					left : evt.clientX,
					top	: evt.clientY
				}).children().addClass('active');
				target.addClass('hover').data('group') && $('#editBtn').removeClass('active');
				$('#mask').removeClass('hidden').width(body.width()).height(body.height());
			}
			return false;
		}
	});
	storage.getItem('hide_default') && $('#showDefault .checkbox').removeClass('checked');
	$('#showDefault').click(function() {
		storage.getItem('hide_default') ? storage.removeItem('hide_default') : storage.setItem('hide_default', 1);
		$(this).children('.checkbox').toggleClass('checked');
		redraw();
	});
	showCurrent.click(function() {
		var checkbox = $(this).children('.checkbox');
		if (checkbox.hasClass('checked')) {
			$('#page table tr').removeClass('hidden');
			checkbox.removeClass('checked');
		} else {
			filter(function() {
				checkbox.addClass('checked');
			});
		}
	});
	$('#addBtn,#editBtn').click(function(evt) {
		if (evt.auto || $(this).hasClass('active')) {
			var tr = $(table).find('tr.hover'),
			group = tr.data('group'),
			ip = tr.data('ip'),
			template = {};
			editing = null;
			if (group) {
				template = { group : group };
			} else if (ip) {
				template = this.id === 'addBtn' ? { group : ip.group } : ip;
				editing = ip;
			}
			$('#addInputs :text[name]').each(function() {
				this.value = template[this.name] || '';
			});
			$('#addInputs').addClass('expand');
		}
	});
	$('#trashBtn').click(function() {
		var tr = $(table).find('tr.hover'),
		group = tr.data('group'),
		ip = tr.data('ip');
		if (group) {
			delete data.groups[group];
			save();
		} else if (ip) {
			delete data.groups[ip.group][ip.hostname];
			var i, isEmpty = true;
			for (i in data.groups[ip.group]) {
				isEmpty = false;
			}
			isEmpty && delete data.groups[ip.group];
			save();
		}
	});
	$('#cancelBtn').click(function() {
		$('#addInputs').removeClass('expand').children(':text').val('').removeClass('error');
	});
	$('#saveBtn').click(function() {
		if (!$('#addInputs :text').blur().filter('.error').length) {
			if (editing) {
				delete data.groups[editing.group][editing.hostname];
			}
			var ip = { enable : true };
			$('#addInputs :text[name]').each(function() {
				ip[this.name] = this.value;
				if (this.name === 'group' && !this.value) {
					ip['group'] = 'DEFAULT';
				}
			});
			data.groups[ip.group] = data.groups[ip.group] || {};
			data.groups[ip.group][ip.hostname] = ip;
			save();
			$('#addInputs').removeClass('expand');
		}
	});
	$('#backupBtn').click(function() {
		background.set(data.groups, true);
		showTip('Saved to ' + data.file + '.bak');
	});
	$('#addInputs :text').blur(function() {
		var $this = $(this);
		$this[(RegExp($this.data('reg')).test($this.val()) ? 'remove' : 'add') + 'Class']('error');
	});
	if (storage.getItem('show_tip')) {
		tip.removeClass('hidden').find('i').attr('title', data.file).click(function() {
			chrome.tabs.create({
				url : 'file:///' + data.file.replace(/\\/g, '/')
			});
		}).end().find('span').click(function() {
			storage.removeItem('show_tip');
			tip.addClass('transparent');
			setTimeout(function() {
				tip.addClass('hidden');
			}, 400);
		});
		setTimeout(function() {
			tip.removeClass('transparent');
		}, 0);
	}
	getCurrentTab(function(tab) {
		if (!tab.url.indexOf('http')) {
			var info = background.info(tab.url);
			info && $('#currentIP').text(info).removeClass('hidden');
		}
	});
	$('html').click(function() {
		$('#menu,#mask').addClass('hidden');
		$(table).find('tr').removeClass('hover');
	});
	document.oncontextmenu = function() {
		return false;
	};
	redraw();
});
