

(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define([], function() {
			return factory(root, root.document);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory(root, root.document);
 	} else {
		root.slidePage= factory(root, root.document);
	}
}(typeof window !== 'undefined' ? window : this, function (window, document) {
	'use strict';
	var supportsPassive = false;
	try {
		var opts = Object.defineProperty({}, 'passive', {
			get: function () {
				supportsPassive = true;
			}
		});
		window.addEventListener("test", null, opts);
	} catch (e) { }
	var utils = {
		getQueryParam: function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]); return null;
		},
		extend: function (obj1, obj2) {
			for (var attr in obj2) {
				obj1[attr] = obj2[attr];
			}
			return obj1;
		},
		isEqualNode: function (el1, el2) {
			var equalNodeName = el1.nodeName === el2.nodeName;
			var equalNodeType = el1.nodeType === el2.nodeType;
			var equalHTML = el1.innerHTML === el2.innerHTML;
			var equalClass = el1.className.replace(/ transition/g, '') === el2.className.replace(/ transition/g, '');
			return equalClass && equalNodeName && equalNodeType && equalHTML;
		},
		isDOM: function(obj){
			if ((obj instanceof NodeList) || (obj instanceof HTMLCollection) && obj.length > 0) {
				var isTrue = 0;
				for (var i = 0, len = obj.length; i < len; i ++) {
					(obj[i] instanceof Element) && (isTrue++);
				}
				return isTrue === len;
			} else {
				return (obj instanceof Element);
			}
		}
	}
	var touchPoint = {}
	var eventHandler = {
		wheelFunc: function (e) {
			var e = e || window.event;
			if (e.wheelDeltaY < 0 || e.wheelDelta < 0 || e.detail > 0) {
				this.canSlide && this.canNext && this.slideNext();
			} else if (e.wheelDeltaY > 0 || e.wheelDelta > 0 || e.detail < 0) {
				this.canSlide && this.canPrev && this.slidePrev();
			}
		},
		touchStart: function (e) {
			touchPoint.startpoint = e.targetTouches[0].clientY;
		},
		touchMove: function (e) {
			var offsetY = e.targetTouches[0].clientY - touchPoint.startpoint;
			!this.canPrev && offsetY > 5 && (this.isScroll = true);    //-- 滚动到底部往上滑可继续滚动条滚动
			!this.canNext && offsetY < -5 && (this.isScroll = true);   //-- 滚动到顶部往下滑可继续滚动条滚动
			!this.isScroll && e.preventDefault();
			touchPoint.endpoint = e.targetTouches[0].clientY;
		},
		touchEnd: function (e) {
			if (touchPoint.endpoint === 0) {
				return false;
			}
			if ((touchPoint.endpoint - touchPoint.startpoint) < -60) {
				this.canSlide && this.canNext && this.slideNext();
			} else if ((touchPoint.endpoint - touchPoint.startpoint) > 60) {
				this.canSlide && this.canPrev && this.slidePrev();
			}
			touchPoint.startpoint = 0;
			touchPoint.endpoint = 0;
		},
		transitionEnd: function (event) {
			if (event.target.isEqualNode(this.items[this.page - 1])) {
				if (this.direction == 'next') {
					this.opt.after(this.page - 1, this.direction, this.page);
					this.opt.refresh && methods.resetAnimation.call(this, this.page - 2);
				} else if (this.direction == 'prev') {
					this.opt.after(this.page + 1, this.direction, this.page);
					this.opt.refresh && methods.resetAnimation.call(this, this.page);
				}
				this.canSlide = true;
			}
		}
	}
	var methods = {
		slideScroll: function (index) {
			var itemheight = this.items[index].children[0].offsetHeight;
			var windowH = window.innerHeight;
			var judgeScroll = function (index) {
				var windowH = window.innerHeight;
				var isBottom = itemheight <= this.items[index].scrollTop + windowH;
				var isTop = this.items[index].scrollTop == 0;
				this.canPrev = isTop && !isBottom;
				this.canNext = isBottom && !isTop;
				this.isScroll = !(isBottom || isTop)
			}.bind(this)
			if ((itemheight - windowH) > 20) {
				this.items[index].children[0].children[0].focus();
				judgeScroll(index);
				if (this.direction == 'next') {
					this.items[index].scrollTop = 0;
				} else if (this.direction == 'prev') {
					this.items[index].scrollTop = itemheight - windowH;
				}
				this.items[index].addEventListener('scroll', function(e) {
					judgeScroll(index);
				});
			} else {
				this.canPrev = true;
				this.canNext = true;
				this.isScroll = false;
			}
		},
		// 重置动画状态，全部隐藏
		resetAnimation: function (index) {
			if (this.opt.useAnimation && this.opt.refresh) {
				if (!this.items[index]) {
					return false;
				}
				var steps = this.items[index].querySelectorAll('.step');
				var lazys = this.items[index].querySelectorAll('.lazy');
				steps.length > 0 && steps.forEach(function (element) {
					element.style.display = 'none';
				})
				lazys.length > 0 && lazys.forEach(function (element) {
					element.style.display = 'none';
				})
			}
		},
		// 自动触发动画
		runAnimation: function (index, lazy) {
			if (this.opt.useAnimation) {
				var steps = this.items[index].querySelectorAll(lazy || '.step');
				steps.forEach(function (element) {
					var delay = element.getAttribute('data-delay') || 100;
					var timer = setTimeout(function () {
						element.style.display = '';
						clearTimeout(timer);
					}, delay);
				})
			}
		},
		initAnimation: function (items, index) {
			if (this.opt.useAnimation) {
				var steps = this.container.querySelectorAll('.step');
				var lazys = this.container.querySelectorAll('.lazy');
				steps.length > 0 && steps.forEach(function (element) {
					element.style.display = 'none';
				})
				lazys.length > 0 && lazys.forEach(function (element) {
					element.style.display = 'none';
				})
				methods.runAnimation.call(this, index);
			}
			for (var i = 0, item; item = this.items[i]; i++) {
				if (i === index) {
					item.style.transform = 'translate3d(0, 0, 0)';
				} else {
					if (i < index) {
						item.style.transform = 'translate3d(0, -100%, 0)';
					} else if (i > index) {
						item.style.transform = 'translate3d(0, 100%, 0)';
					}
				}
				(function(item) {
					var timer = setTimeout(function () {
						item.classList.add('transition');
						clearTimeout(timer);
					});
				})(item)
			}
		},
	
		initEvent: function () {
			// 滚轮事件
			if (this.opt.useWheel) {
				// document.onmousewheel = eventHandler.wheelFunc.bind(this)
				document.addEventListener('DOMMouseScroll', this.eventHandler.wheelFunc, supportsPassive ? { passive: true } : false);
				document.addEventListener('mousewheel', this.eventHandler.wheelFunc, supportsPassive ? { passive: true } : false);
			}
	
			// 滑动事件
			if (this.opt.useSwipe) {
				touchPoint = {
					startpoint: 0,
					endpoint: 0
				}
				this.container.addEventListener('touchstart', this.eventHandler.touchStart, supportsPassive ? { passive: true } : false);
				this.container.addEventListener('touchmove', this.eventHandler.touchMove);
				this.container.addEventListener('touchend', this.eventHandler.touchEnd, supportsPassive ? { passive: true } : false);
			}
	
			// 当每次滑动结束后的触发的事件
			this.container.addEventListener('transitionend', this.eventHandler.transitionEnd);
		}
	}
	
	var slidePage = function (opt) {
		var pageParams = utils.getQueryParam('page') * 1;
		var default_opt = {
			page: pageParams || 1,
			slidePages: '.slide-page',
			slideContainer: '.slide-container',
			after: function(){},
			before: function(){},
			refresh: false,
			useWheel: true,
			useSwipe: true,
			useAnimation: true,
		};
		this.canSlide = true;
		this.canNext = true;
		this.canPrev = true;
		this.isScroll = false;

		this.opt = utils.extend(default_opt, opt);
		this.page = this.opt.page;
		this.container = utils.isDOM(this.opt.slideContainer) ? this.opt.slideContainer : document.querySelector(this.opt.slideContainer);
		this.items = utils.isDOM(this.opt.slidePages) ? this.opt.slidePages : document.querySelectorAll(this.opt.slidePages);
		this.count = this.items.length;
		this.direction = '';
		this.eventHandler = {};
		for (var eventName in eventHandler) {
			this.eventHandler[eventName] = eventHandler[eventName].bind(this);
		}
		methods.initEvent.call(this);
		methods.slideScroll.call(this, this.page - 1);
		methods.initAnimation.call(this, this.items, this.page - 1);
		this.slideTo(this.page);
	}
	
	
	slidePage.prototype.slideNext = function (optimize) {
		if (this.count <= this.page) {
			return false;
		}
		this.direction = 'next';
		methods.slideScroll.call(this, this.page);
		this.items[this.page - 1].style.transform = 'translate3d(0, -100%, 0)';
		this.items[this.page].style.transform = 'translate3d(0, 0, 0)';
		this.page++;
		this.opt.before(this.page - 1, this.direction, this.page);
	
		if (!optimize) {
			this.canSlide = false;
			methods.runAnimation.call(this, this.page - 1);
		}
	}
	slidePage.prototype.slidePrev = function (optimize) {
		if (1 >= this.page) {
			return false;
		}
		this.direction = 'prev';
		methods.slideScroll.call(this, this.page - 2);
		this.items[this.page - 2].style.transform = 'translate3d(0, 0, 0)';
		this.items[this.page - 1].style.transform = 'translate3d(0, 100%, 0)';
		this.page--;
		this.opt.before(this.page + 1, this.direction, this.page);
		if (!optimize) {
			this.canSlide = false;
			methods.runAnimation.call(this, this.page - 1);
		}
	}
	
	slidePage.prototype.slideTo = function (index) {
		if (index >= 1 && index <= this.count) {
			if (index == this.page) {
				return false;
			}
			if (index > this.page) {
				// 优化：当中间有一个以上的page将略过渲染
				for (var i = this.page + 1; i < index; i++) {
					this.slideNext('optimize');
				}
				this.slideNext();
			} else if (index < this.page) {
				for (var i = this.page - 1; i > index; i--) {
					this.slidePrev('optimize');
				}
				this.slidePrev();
			}
		}
	}
	
	slidePage.prototype.slideFire = function (page) {
		var index = page ? page - 1 : this.page - 1;
		methods.runAnimation.call(this, index, '.lazy');
	}
	
	slidePage.prototype.destroy = function () {
		if (this.opt.useAnimation) {
			// 移除所有隐藏元素
			var i = 0, len = this.items.length;
			var steps = this.container.querySelectorAll('.step');
			var lazys = this.container.querySelectorAll('.lazy');
			steps.length > 0 && steps.forEach(function (element) {
				element.style.display = '';
			})
			lazys.length > 0 && lazys.forEach(function (element) {
				element.style.display = '';
			})
			methods.runAnimation.call(this, 0);
		}
	
		// 滚轮事件
		if (this.opt.useWheel) {
			document.removeEventListener('DOMMouseScroll', this.eventHandler.wheelFunc);
			document.removeEventListener('mousewheel', this.eventHandler.wheelFunc);
			this.items[this.page - 1].style.transform = 'translate3d(0, 0, 0)';
		}
	
		// 滑动事件
		if (this.opt.useSwipe) {
			var startpoint = 0;
			var endpoint = 0;
	
			this.container.removeEventListener('touchstart', this.eventHandler.touchStart);
			this.container.removeEventListener('touchmove', this.eventHandler.touchMove);
			this.container.removeEventListener('touchend', this.eventHandler.touchEnd);
		}
	
		// 当每次滑动结束后的触发的事件
		this.container.removeEventListener('transitionend', this.eventHandler.transitionEnd);
	}
	
	slidePage.prototype.update = function (pages) {
		// 回到第一屏
		this.canSlide = true;
		this.canNext = true;
		this.canPrev = true;
		var newItems = utils.isDOM(pages) ? pages : document.querySelectorAll(this.opt.slidePages);
		for (var i = 0, len = newItems.length; i < len; i++) {
			// 判断当前活动的page是否还存在则保持当前屏
			if (this.items[this.page - 1] && utils.isEqualNode(this.items[this.page - 1], newItems[i])) {
				this.page = i + 1;
				break;
			}
			// 匹配到最后一个都不存在当前元素，则自动转到第一屏
			if (i === len - 1) {
				this.page = 1;
			}
		}
		this.items = newItems;
		this.count = this.items.length;
		this.slideTo(this.page);
		methods.initAnimation.call(this, this.items, this.page - 1);
	}
	return slidePage;
}));