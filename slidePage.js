(function() {
    var page =  location.search?urlToObject(location.search).page:1;
    var opt = {
        index:page,
        'after': function() {},
        'before': function() {},
        'speed': false,
        'refresh': true,
        'useArrow': true,
        'useAnimation': true,
        'useMusic': {
            'autoPlay': true,
            'loopPlay': true,
            'src': 'http://mat1.gtimg.com/news/2015/love/FadeAway.mp3'
        }
    };
    window.slidePage = {
        'init': function(option) {
            $.extend(opt, option);
            initDom(opt);
            initEvent(opt)
        }
    };
    var obj = {
        'nextSlide': function(item) {
            item.css('-webkit-transform', 'translate3d(0,-100%,0)');
            item.next().css('-webkit-transform', 'translate3d(0,0,0)')
        },
        'prevSlide': function(item) {
            item.prev().css('-webkit-transform', 'scale(1)');
            item.css('-webkit-transform', 'translate3d(0,100%,0)')
        },
        'showSlide': function(item) {
            item.css('-webkit-transform', 'scale(1)');
            item.next().css('-webkit-transform', 'translate3d(0,100%,0)')
        }
    }
    var after=true;
    var prevItem;
    var direction = IsPC();//-- 当客户端为PC的时候默认为true
    var keyIndex = opt.index - 1;

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
        }
    }
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

    function swipeUp(event) {
        var item = $(event.target).closest('.item');
        if (!item.length) {
            return
        }
        nextSlide(item)
    }
    function swipeDown(event) {
        var item = $(event.target).closest('.item');
        if (!item.length) {
            return
        }
        prevSlide(item)
    }

    function nextSlide(item) {
        if (item.next().length) {
            currentItem = item.next();
            orderStep(item.next(),'next');
            obj.nextSlide(item);
            opt.before(item.index()+1);
        } else {
            obj.showSlide(item)
        }
    }
    function prevSlide(item) {
        if (item.prev().length) {
            currentItem = item.prev();
            orderStep(item.prev(),'prev');
            obj.prevSlide(item);
            item.prev().prev().css('-webkit-transform', 'translate3d(0px, -100%, 0px)');
            opt.before(item.index()+1);
        } else {
            obj.showSlide(item)
        }
    }
    function initDom(opt) {
        //-- 这里在移动端下有个奇怪的问题：如果设置了speed参数，也就是当js设置了下面这个css属性，那么这个css动画的时间曲线会变成匀速过渡（linear）,所以speed只能默认为false暂时避免这问题。
        //-- 如果有大神知道怎么解决请fork或联系我qq：296183464 谢谢。
        if(opt.speed){
            $('.item').css({'transition-duration':opt.speed+'ms','-webkit-transition-duration':opt.speed+'ms'});
        }
        currentItem = $('.item').eq(opt.index - 1);
        prevItem = currentItem.prev();
        currentItem.css('-webkit-transform', 'translate3d(0px, 0px, 0px)');
        prevItem.css('-webkit-transform', 'translate3d(0px, -100%, 0px)');
        if (opt.useAnimation) {
            var items = $('.item');
            items.find('.step').addClass('hide');
            orderStep(items.eq(opt.index - 1))
        }
        if (opt.useArrow) {
            $('.item').slice(0, $('.item').length - 1).append('<span class="arrow"></span>')
        }
        if (opt.useMusic) {
            var autoplay = opt.useMusic.autoPlay ? 'autoplay="autoplay"' : '';
            var loopPlay = opt.useMusic.loopPlay ? 'loop="loop"' : '';
            var src = opt.useMusic.src;
            $('body').append('<span class="music play"><audio id="audio" src=' + src + ' ' + autoplay + ' ' + loopPlay + '></audio></span>')
        }
    }
    function orderStep(dom,directions) {
        after=true;
        setTimeout(function(){
            direction = directions||direction;
        },opt.speed||700)
        var steps = $(dom).find('.step');
        steps.forEach(function(item) {
            var time = $(item).attr('data-delay') || 100;
            setTimeout(function() {
                $(item).removeClass('hide')
            }, time)
        })
    }
    function initEvent(opt) {
        document.onmousewheel = function(e){
            console.log(direction)
            if(e.wheelDeltaY<0&&direction&&keyIndex<$('.item').length-1){
                nextSlide($('.item').eq(keyIndex++))
                direction=false;
            }else if(e.wheelDeltaY>0&&direction&&keyIndex>0){
                prevSlide($('.item').eq(keyIndex--))
                direction=false;
            }
        }
        document.onkeydown = function(e){
            if(e.keyCode=='40'&&direction&&keyIndex<$('.item').length-1){
                nextSlide($('.item').eq(keyIndex++))
                direction=false;
            }else if(e.keyCode == '38'&&direction&&keyIndex>0){
                prevSlide($('.item').eq(keyIndex--))
                direction=false;
            }
        }
        $('.music').on('tap', function() {
            $(this).toggleClass('play');
            var audio = document.getElementById('audio');
            if (audio.paused) {
                audio.play()
            } else {
                audio.pause()
            }
        });
        $('.slidePage-container').on('touchmove', function(e) {
            e.preventDefault()
        });
        $('.item').on({
            'swipeUp': swipeUp,
            'swipeDown': swipeDown
        });
        $('.item').on('transitionend webkitTransitionEnd', function(event) {
            if(after){
                opt.after($(event.target).index()+1);
                if(opt.refresh&&direction&&opt.useAnimation){
                    direction=='next'?$(event.target).prev().find('.step').addClass('hide'):$(event.target).find('.step').addClass('hide');
                    direction=false;
                }
                after=false;
            }
        })
    }
})();