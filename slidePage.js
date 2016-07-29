(function($) {
    var page =  location.search?urlToObject(location.search).page:1;
    var opt = {
        'index':page,
        'pageContainer': '.item',
        'after': function() {},
        'before': function() {},
        'speed': false,
        'refresh': false,
        'useWheel': true,
        'useKeyboard':true,
        'useAnimation': true,
    };
    var after=true;
    var delay = true;
    var keyIndex = opt.index - 1;
    var defaultSpeed = $(opt.pageContainer).css('transition-duration').replace('s','')*1000;
    var pageCount = $(opt.pageContainer).length
    var windowH = window.innerHeight
    var direction=''

    window.slidePage = {
        'init': function(option,callback) {
            $.extend(opt, option);
            initDom(opt);
            initEvent(opt);
            callback&&callback.call(this)
        },

        'index': function(index){
            if(index>0&&index!=keyIndex+1){
                index=parseInt(index)-1;
                var endheight = $(".item").eq(index).children().height();
                var offset=(endheight-windowH)>20?1:0 //-- 判断最终页如果是滚动条模式的话偏移量为1
                if(index>keyIndex){
                    for(var i= keyIndex;i<index;i++){
                        nextPage($(opt.pageContainer).eq(i));
                        isScroll(i+2,offset)
                        slideScroll(i+2)
                    }
                }else if(index<keyIndex){
                    for(var i=keyIndex;i>=index+1;i--){
                        prevPage($(opt.pageContainer).eq(i));
                        isScroll(i,offset)
                        slideScroll(i)
                    }
                }
                keyIndex=index;
            }
            return keyIndex
        },
        'next': function(){
            if(keyIndex<pageCount-1){
                var item = $(opt.pageContainer).eq(keyIndex++)
                nextPage(item)
                isScroll(item.index()+2)
                slideScroll(item.index()+2)
                delay=false
            }
        },
        'prev': function(){
            if(keyIndex>0){
                var item = $(opt.pageContainer).eq(keyIndex--)
                prevPage(item)
                isScroll(item.index())
                slideScroll(item.index())
                delay=false
            }
        },
        'fire':function(index){
            fireAnimate(index)
        },

        canNext:true,
        canPrev:true,
        isScroll:false,//-- 移动端控制滚动或滑动

    };
    var obj = {
        'nextSlide': function(item) {
            item.css({'transform':'translate3d(0px, -100%, 0px)','-webkit-transform':'translate3d(0px,-100%, 0px)'});
            var css = translate('0')
            item.next().css(css)
        },
        'prevSlide': function(item) {
            item.prev().css({'-webkit-transform': 'scale(1)','transform': 'scale(1)'});
            item.css(translate('100%'))
        },
        'showSlide': function(item) {
            item.css({'-webkit-transform': 'scale(1)','transform': 'scale(1)'});
            item.next().css(translate('100%'))
        }
    }
    //-- 判断pc端
    function IsPC() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    //-- translate兼容性封装
    function translate(y){
        return {'-webkit-transform':'translate3d(0px, '+y+' 0px)','transform':'translate3d(0px, '+y+', 0px)'}
    }

    //-- 滚动执行动画
    function pageActive(){
        if(opt.refresh&&delay&&opt.useAnimation){
            $(opt.pageContainer).eq(keyIndex).find('.step').addClass('hide')
            $(opt.pageContainer).eq(keyIndex).find('.lazy').addClass('hide')
        }
    }
    //-- 拆分url的参数
    function urlToObject(url){
        var urlObject = {};
        if (/\?/.test(url)) {
            var urlString = url.substring(url.indexOf("?")+1);
            var urlArray = urlString.split("&");
            for (var i=0, len=urlArray.length; i<len; i++) {
                var urlItem = urlArray[i];
                var item = urlItem.split("=");
                urlObject[item[0]] = item[1];
            }
            return urlObject;
        }else{
            return urlObject.page = 1;
        }
    }
    //-- 滚动下一屏执行过程
    function nextPage(item) {
        direction = 'next'
        if (item.next().length) {
            currentItem = item.next();
            orderStep(item.next(),direction);
            obj.nextSlide(item);
        } else {
            obj.showSlide(item);
        }
        opt.before(item.index()+1,direction,item.index()+2);
        keyindex = $(opt.pageContainer).index(item)
        pageActive()
    }
    //-- 滚动上一屏执行过程
    function prevPage(item) {
        direction = 'prev'
        if (item.prev().length) {
            currentItem = item.prev();
            orderStep(item.prev(),direction);
            obj.prevSlide(item);
            item.prev().prev().css(translate('-100%'));
        } else {
            obj.showSlide(item);
        }
        opt.before(item.index()+1,direction,item.index());
        keyindex = $(opt.pageContainer).index(item)
        pageActive()
    }
    //-- 初始化元素
    function initDom(opt) {
        //-- 这里在移动端下有个奇怪的问题：如果设置了speed参数，也就是当js设置了下面这个css属性，那么这个css动画的时间曲线会变成匀速过渡（linear）,所以speed只能默认为false暂时避免这问题。
        //-- 如果有大神知道怎么解决请fork或联系我qq：296183464 谢谢。
        if (!!opt.speed){
            $(opt.pageContainer).css({'transition-duration':opt.speed+'ms','-webkit-transition-duration':opt.speed+'ms'});
        }
        slidePage.index(opt.index)// 初始化指定页码

        if (!!opt.useAnimation) {
            var items = $(opt.pageContainer);
            items.find('.step').addClass('hide');
            items.find('.lazy').addClass('hide');
            orderStep(items.eq(opt.index - 1))
        }
    }
    //-- 默认触发动画
    function orderStep(dom,delays) {
        after=true;
        setTimeout(function(){
            delay = delays||delay;
        },opt.speed||defaultSpeed)
        var steps = $(dom).find('.step');
        steps.each(function(index,item) {
            var time = $(item).attr('data-delay') || 100;
            setTimeout(function() {
                $(item).removeClass('hide')
            }, time)
        })
    }
    //-- 手动触发动画
    function fireAnimate(index) {
        var item = $(opt.pageContainer).eq(index - 1);
        var lazy = item.find('.lazy')
        lazy.each(function(i,item) {
            var time = $(item).attr('data-delay') || 100;
            setTimeout(function() {
                $(item).removeClass('hide')
            }, time)
        })
    }

    //-- 判断滚动模式
    function isScroll(target,offset){
        var offset = offset===0?0:false||1
        var itemheight = $(".item").eq(target - 1).children().height();
        if((itemheight-windowH)>20){
            var isNext = direction == 'next';   //-- 判断方向
            !isNext?$(opt.pageContainer).eq(target-1).scrollTop(itemheight-windowH-offset):$(opt.pageContainer).eq(target-1).scrollTop(offset) //如果是往下滚来的就滚动条定位在顶部，往上滚来的就滚动条定位在底部
        }
    }

    //-- 处理滚动条模式
    function slideScroll(target){
        var itemheight = $(".item").eq(target - 1).children().height();
        if((itemheight-windowH)>20){
            $(opt.pageContainer).eq(target-1).on('scroll',function(e){
                var isBottom = itemheight == this.scrollTop+windowH;
                var isTop = this.scrollTop==0;
                slidePage.canSlide = isBottom || isTop;
                slidePage.canPrev = isTop && !isBottom;
                slidePage.canNext = isBottom && !isTop;
                slidePage.isScroll = !(slidePage.canSlide)
            });
        }else{
            slidePage.canPrev = true;
            slidePage.canNext = true;
            slidePage.canSlide = true;
            slidePage.isScroll = false;
        }

    }

    //-- 各种事件交互
    function initEvent(opt) {
        //-- 滚轮事件触发
        function wheelFunc(e){
            var e = e|| window.event
            if(e.wheelDeltaY<0||e.wheelDelta<0||e.detail>0){
                slidePage.canNext&&delay&&slidePage.next();
            }else if(e.wheelDeltaY>0||e.wheelDelta>0||e.detail<0){
                slidePage.canPrev&&delay&&slidePage.prev();
            }

        }
        //-- 滚轮事件兼容处理
        if(!!opt.useWheel){
            document.onmousewheel = wheelFunc
            document.addEventListener&& document.addEventListener('DOMMouseScroll',wheelFunc,false);
        }
        //-- 键盘事件
        if(!!opt.useKeyboard){
            document.onkeydown = function(e){
                if(e.keyCode=='40'&&delay&&keyIndex<pageCount-1){
                    slidePage.canNext&&slidePage.next();
                }else if(e.keyCode == '38'&&delay&&keyIndex>0){
                    slidePage.canPrev&&slidePage.prev();
                }
            }
        }
        //-- 获取触控开始位置
        var touchY = 0
        //由于zepto与jquery对象的事件返回不一致，所以这里用原生来统一
        document.getElementById('slidePage-container').addEventListener('touchstart',function(e){
            touchY = e.touches[0].clientY
        })
        //-- 判断触控移动方向
        document.getElementById('slidePage-container').addEventListener('touchmove',function(e){
            var offsetY = e.touches[0].clientY-touchY
            !slidePage.canPrev&&offsetY>5&&(slidePage.isScroll=true)    //-- 滚动到底部往上滑可继续滚动条滚动
            !slidePage.canNext&&offsetY<-5&&(slidePage.isScroll=true)   //-- 滚动到顶部往下滑可继续滚动条滚动
            !slidePage.isScroll&&e.preventDefault()
        });
        //-- 手势滑动
        $(opt.pageContainer).on({
            'swipeUp':  function () {
                slidePage.canNext&&slidePage.next();
            },
            'swipeDown':  function () {
                slidePage.canPrev&&slidePage.prev();
            }
        });

        //-- 监听css过渡结束的事件
        $(opt.pageContainer).on('transitionend webkitTransitionEnd', function(event) {
            if(after){
                opt.after(direction=='next'?keyIndex:keyIndex+2,direction,keyIndex+1);
                after=false;
            }
        })
    }
})($);