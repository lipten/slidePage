(function UniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["slidePage"] = factory();
	else
		root["slidePage"] = factory();
})(window, function() {
	const slidePage = (function() {
		// supportsPassive 判断
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
			getQueryParam: function(url = location.href) {
				const query_match = url.match(/([^?=&]+)(=([^&]*))/g)
				return !!query_match && query_match.reduce((a, v) => (a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1), a), {});
			},
			extend: function(obj1, obj2) {
				for (let attr in obj2) {
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
			isDOM: function (obj) {
				if ((obj instanceof NodeList) || (obj instanceof HTMLCollection) && obj.length > 0) {
					var isTrue = 0;
					var len = obj.length
					for (let i = 0; i < len; i++) {
						(obj[i] instanceof Element) && (isTrue++);
					}
					return isTrue === len;
				} else {
					return (obj instanceof Element);
				}
			}
		}

		// 记录touch事件的xy
		var touchPoint = {}
		// 鼠标滚轮是事件节流记录时间
		var prevTime = new Date().getTime();
		// 所有事件处理器
		var eventHandler = {
			wheelFunc: function(e) {
				var e = e || window.event;
				if (this.isScroll) {
					return;
				}
				var curTime = new Date().getTime();
				var timeDiff = curTime - prevTime;
				prevTime = curTime;
				if(timeDiff <= 200){
					return;
				}
				if (e.wheelDeltaY < 0 || e.wheelDelta < 0 || e.detail > 0) {
					this.canSlide && this.canNext && this.slideNext();
				} else if (e.wheelDeltaY > 0 || e.wheelDelta > 0 || e.detail < 0) {
					this.canSlide && this.canPrev && this.slidePrev();
				}
			},
			touchStart: function(e) {
				if (!this.canSlide) {
					touchPoint.startpoint = -1;
				} else {
					touchPoint.startpoint = e.targetTouches[0].clientY;
				}
			},
			touchMove: function(e) {
				if (touchPoint.startpoint === -1) {
					e.preventDefault();
					return false;
				}
				var offsetY = e.targetTouches[0].clientY - touchPoint.startpoint;
				!this.canPrev && offsetY > 5 && (this.isScroll = true);    //-- 滚动到底部往上滑可继续滚动条滚动
				!this.canNext && offsetY < -5 && (this.isScroll = true);   //-- 滚动到顶部往下滑可继续滚动条滚动
				!this.isScroll && e.preventDefault();
				if (this.opt.dragMode && this.canSlide && this.isScroll != true) {
					if (offsetY < -5 && this.count > this.page && this.canNext) {
						this.items[this.page-1].style.transform = 'translate3d(0, ' + offsetY.toFixed(2) + 'px, 0)';
						this.items[this.page].style.transform = 'translate3d(0, ' + (window.innerHeight + offsetY).toFixed(2) + 'px, 0)';
						touchPoint.endpoint = e.targetTouches[0].clientY;
					}
					if (offsetY > 5 && this.page > 1 && this.canPrev) {
						this.items[this.page - 2].style.transform = 'translate3d(0, -' + (window.innerHeight - offsetY).toFixed(2) + 'px, 0)';
						this.items[this.page - 1].style.transform = 'translate3d(0, ' + offsetY.toFixed(2) + 'px, 0)';
						touchPoint.endpoint = e.targetTouches[0].clientY;
					}
				}
				if (!this.opt.dragMode) {
					touchPoint.endpoint = e.targetTouches[0].clientY;
				}
			},
			touchEnd: function(e) {
				if (touchPoint.endpoint === 0 || touchPoint.startpoint === -1) {
					return false;
				}
				var offsetDrag = (touchPoint.endpoint - touchPoint.startpoint)
				if (this.opt.dragMode) {
					var thresholdDistance = window.innerHeight / 4;
					if (offsetDrag < -1 * thresholdDistance) {
						this.canSlide && this.canNext && this.slideNext();
					} else if (offsetDrag > thresholdDistance) {
						this.canSlide && this.canPrev && this.slidePrev();
					} else if (offsetDrag > -1 * thresholdDistance && offsetDrag < thresholdDistance) {
						methods.resetSlideForDrag();
					}
				} else {
					if ((touchPoint.endpoint - touchPoint.startpoint) < -60) {
						this.canSlide && this.canNext && this.slideNext();
					} else if ((touchPoint.endpoint - touchPoint.startpoint) > 60) {
						this.canSlide && this.canPrev && this.slidePrev();
					}
				}
				touchPoint.startpoint = 0;
				touchPoint.endpoint = 0;
			},
			transitionEnd: function(event) {
				if (utils.isEqualNode(event.target, this.items[this.page - 1])) {
					if (this.opt.dragMode) {
						this.items[this.page - 1].classList.remove('transition');
						this.items[this.page - 2] && this.items[this.page - 2].classList.remove('transition');
						this.items[this.page] && this.items[this.page].classList.remove('transition');
					}
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

		// 滑屏基础方法
		var methods = {
			slideScroll: function(index, command) {
				var itemheight = this.items[index].children[0].offsetHeight;
				var windowH = window.innerHeight;
				var judgeScroll = function (index) {
					var windowH = window.innerHeight;
					var isBottom = itemheight <= this.items[index].scrollTop + windowH;
					var isTop = this.items[index].scrollTop == 0;
					this.canPrev = isTop && !isBottom;
					this.canNext = isBottom && !isTop;
					this.isScroll = !(isBottom || isTop)
				}.bind(this, index)
				if (command == 'removeListener') {
					this.items[index].removeEventListener('scroll', judgeScroll);
					return;
				}
				if ((itemheight - windowH) > 10) {
					this.items[index].children[0].children[0].focus();
					judgeScroll();
					if (this.direction == 'next') {
						this.items[index].scrollTop = 0;
					} else if (this.direction == 'prev') {
						this.items[index].scrollTop = itemheight - windowH;
					}
					this.items[index].addEventListener('scroll', judgeScroll);
				} else {
					this.canPrev = true;
					this.canNext = true;
					this.isScroll = false;
				}
			},
			resetSlideForDrag: function() {
				this.canSlide = false;
				this.items[this.page - 1].classList.add('transition');
				this.items[this.page - 1].style.transform = 'translate3d(0, 0, 0)';
				if (this.items[this.page - 2]) {
					this.items[this.page - 2].classList.add('transition');
					this.items[this.page - 2].style.transform = 'translate3d(0, -100%, 0)';
				}
				if (this.items[this.page]) {
					this.items[this.page].classList.add('transition');
					this.items[this.page].style.transform = 'translate3d(0, 100%, 0)';
				}
			},
			// 重置动画状态，全部隐藏
			resetAnimation: function(index) {
				if (this.opt.useAnimation && this.opt.refresh) {
					if (!this.items[index]) {
						return false;
					}
					var steps = Array.prototype.slice.call(this.items[index].querySelectorAll('.step'));
					var lazys = Array.prototype.slice.call(this.items[index].querySelectorAll('.lazy'));
					steps.map((element) => {
						element.style.visibility = 'hidden';
						element.style.animationName = '__' + window.getComputedStyle(element).animationName;
					})
					lazys.map((element) => {
						element.style.visibility = 'hidden';
						element.style.animationName = '__' + window.getComputedStyle(element).animationName;
					})
				}
			},
			// 自动触发动画
			runAnimation: function(index, lazy) {
				if (this.opt.useAnimation) {
					var steps = this.items[index].querySelectorAll(lazy || '.step');
					Array.prototype.slice.call(steps).map((element) => {
						triggerAnim(element);
					})
					function triggerAnim(element) {
						var delay = element.getAttribute('data-delay') || 100;
						var timer = setTimeout(function () {
							// 将style属性去除即可播放动画
							element.style.visibility = '';
							element.style.animationName = '';
							clearTimeout(timer);
						}, delay);
					}
				}
			},
			initAnimation: function(items, index) {
				if (this.opt.useAnimation) {
					var steps = Array.prototype.slice.call(this.container.querySelectorAll('.step'));
					var lazys = Array.prototype.slice.call(this.container.querySelectorAll('.lazy'));
					steps.map((element) => {
						// 初始设置动画元素为不可见，且animationName是不可用的以控制不播放动画
						element.style.visibility = 'hidden';
						element.style.animationName = '__' + window.getComputedStyle(element).animationName;
					})
					lazys.map((element) => {
						element.style.visibility = 'hidden';
						element.style.animationName = '__' + window.getComputedStyle(element).animationName;
					})
					methods.runAnimation.call(this, index);
				}
				for (let i = 0, item; item = this.items[i]; i++) {
					item.style.transform = 'translate3d(0, ' + (i < index ? '-100%' : i > index ? '100%' : '0')  + ', 0)';

					if (!this.opt.dragMode) {
						// 交给下一次宏任务延迟执行
						let timer = setTimeout(function () {
							item.classList.add('transition');
							clearTimeout(timer);
						});
					}
				}
			},
			// 注册事件
			initEvent: function () {
				// 滚轮事件
				if (this.opt.useWheel) {
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

		class slidePage {
			constructor(opt) {
				var pageParams = utils.getQueryParam('page') * 1;
				var default_opt = {
					page: pageParams || 1,
					slidePages: '.slide-page',
					slideContainer: '.slide-container',
					after: function () { },
					before: function () { },
					refresh: false,
					useWheel: true,
					useSwipe: true,
					useAnimation: true,
					dragMode: false,
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

			slideNext(optimize) {
				if (this.count <= this.page) {
					return false;
				}
				if (this.opt.dragMode) {
					this.items[this.page - 1].classList.add('transition');
					this.items[this.page].classList.add('transition');
				}
				this.direction = 'next';
				methods.slideScroll.call(this, this.page - 1, 'removeListener');
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

			slidePrev(optimize) {
				if (1 >= this.page) {
					return false;
				}
				if (this.opt.dragMode) {
					this.items[this.page - 2].classList.add('transition');
					this.items[this.page - 1].classList.add('transition');
				}
				this.direction = 'prev';
				methods.slideScroll.call(this, this.page - 1, 'removeListener');
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
			
			slideTo(index) {
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
			
			slideFire(page) {
				var index = page ? page - 1 : this.page - 1;
				methods.runAnimation.call(this, index, '.lazy');
			}
			
			destroy() {
				if (this.opt.useAnimation) {
					// 移除所有隐藏元素
					var i = 0, len = this.items.length;
					var steps = Array.prototype.slice.call(this.container.querySelectorAll('.step'));
					var lazys = Array.prototype.slice.call(this.container.querySelectorAll('.lazy'));
					steps.map((element) => {
						element.style.visibility = '';
					})
					lazys.map((element) => {
						element.style.visibility = '';
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
			
			update(pages) {
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
				methods.slideScroll.call(this, this.page - 1);
			}
		}
		return slidePage;
	})();
	return slidePage;
});