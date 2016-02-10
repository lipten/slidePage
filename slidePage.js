(function() {
    var page =  location.search?urlToObject(location.search).page:1;
    var opt = {
        'index':page,
        'pageContainer': '.item',
        'after': function() {},
        'before': function() {},
        'speed': false,
        'refresh': true,
        'pagination': true,
        'useWheel': true,
        'useKeyboard':true,
        'useArrow': true,
        'useAnimation': true,
        'useMusic': {
            'autoPlay': true,
            'loopPlay': true,
            'src': 'http://info.lipten.net/projects/slidePage/Summer.mp3'
        },
    };
    var after=true;
    var prevItem;
    var direction = true;
    var keyIndex = opt.index - 1;
    var defaultSpeed = $(opt.pageContainer).css('transition-duration').replace('s','')*1000;
    var pageCount = $(opt.pageContainer).length

    window.slidePage = {
        'init': function(option) {
            $.extend(opt, option);
            initDom(opt);
            initEvent(opt);
        },
        'index': function(index){
            if(index>0){
                index=parseInt(index)-1;
                if(index>keyIndex){
                    for(var i= keyIndex;i<index;i++){
                        nextPage($(opt.pageContainer).eq(i));
                    }
                }else if(index<keyIndex){
                    for(var i=keyIndex;i>=index;i--){
                        prevPage($(opt.pageContainer).eq(i+1));
                    }
                }
                keyIndex=index;
                pageActive()
            }
            return keyIndex
        },
        'next': function(){
            if(direction&&keyIndex<pageCount-1){
                nextPage($(opt.pageContainer).eq(keyIndex++))
                direction = false;
            }
        },
        'prev': function(){
            if(direction&&keyIndex>0){
                prevPage($(opt.pageContainer).eq(keyIndex--))
                direction = false;
            }
        },

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

    function pageActive(){
        if(opt.refresh&&direction&&opt.useAnimation){
            direction=='next'?$(opt.pageContainer).eq(keyIndex).find('.step').addClass('hide'):$(opt.pageContainer).eq(keyIndex).find('.step').addClass('hide');
        }
        if (keyIndex+1==pageCount) {
            $(opt.pageContainer).parent().find('.arrow').addClass('hide');
        }else{
            $(opt.pageContainer).parent().find('.arrow').removeClass('hide');
        }
        $('#pagination').find('a').removeClass('active').eq(keyIndex).addClass('active')
    }

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
    function nextPage(item) {
        if (item.next().length) {
            currentItem = item.next();
            orderStep(item.next(),'next');
            obj.nextSlide(item);
        } else {
            obj.showSlide(item);
        }
        opt.before(item.index()+1);
        keyindex = $(opt.pageContainer).index(item)
        pageActive()
    }
    function prevPage(item) {
        if (item.prev().length) {
            currentItem = item.prev();
            orderStep(item.prev(),'prev');
            obj.prevSlide(item);
            item.prev().prev().css('-webkit-transform', 'translate3d(0px, -100%, 0px)');
        } else {
            obj.showSlide(item);
        }
        opt.before(item.index()+1);
        keyindex = $(opt.pageContainer).index(item)
        pageActive()
    }
    function initDom(opt) {
        //-- 这里在移动端下有个奇怪的问题：如果设置了speed参数，也就是当js设置了下面这个css属性，那么这个css动画的时间曲线会变成匀速过渡（linear）,所以speed只能默认为false暂时避免这问题。
        //-- 如果有大神知道怎么解决请fork或联系我qq：296183464 谢谢。
        if (!!opt.speed){
            $(opt.pageContainer).css({'transition-duration':opt.speed+'ms','-webkit-transition-duration':opt.speed+'ms'});
        }
        if(!!opt.pagination){
            var domA = ''
            for(var i= 0;i<pageCount;i++){
                domA+='<a></a>'
            }
            $('body').append('<nav class="pagination" id="pagination"><div class="prev-page" id="prev-page">&Lambda;</div>'+domA+'<div class="next-page" id="next-page">V</div></nav>')
            $('#pagination').css('margin-top',-$('#pagination').height()/2);
            pageActive();

        }
        currentItem = $(opt.pageContainer).eq(opt.index - 1);
        prevItem = currentItem.prev();
        currentItem.css('-webkit-transform', 'translate3d(0px, 0px, 0px)');
        prevItem.css('-webkit-transform', 'translate3d(0px, -100%, 0px)');
        if (!!opt.useAnimation) {
            var items = $(opt.pageContainer);
            items.find('.step').addClass('hide');
            orderStep(items.eq(opt.index - 1))
        }
        if (!!opt.useArrow) {
            $('#slidePage-container').append('<span class="arrow"></span>')
        }
        if (!!opt.useMusic) {
            var autoplay = opt.useMusic.autoPlay ? 'autoplay="autoplay"' : '';
            var loopPlay = opt.useMusic.loopPlay ? 'loop="loop"' : '';
            var src = opt.useMusic.src;
            $('#slidePage-container').append('<span class="music play" id="music"><audio id="audio" src=' + src + ' ' + autoplay + ' ' + loopPlay + '></audio></span>')
        }
    }
    function orderStep(dom,directions) {
        after=true;
        setTimeout(function(){
            direction = directions||direction;
        },opt.speed||defaultSpeed)
        var steps = $(dom).find('.step');
        steps.forEach(function(item) {
            var time = $(item).attr('data-delay') || 100;
            setTimeout(function() {
                $(item).removeClass('hide')
            }, time)
        })
    }
    function initEvent(opt) {
        var tapOrClick = IsPC()?'click':'tap'

        if(!!opt.useWheel){
            document.onmousewheel = function(e){
                if(e.wheelDeltaY<0){
                    slidePage.next();
                }else if(e.wheelDeltaY>0){
                    slidePage.prev();
                }
            }
        }
        if(!!opt.useKeyboard){
            document.onkeydown = function(e){
                if(e.keyCode=='40'&&direction&&keyIndex<pageCount-1){
                    slidePage.next();
                }else if(e.keyCode == '38'&&direction&&keyIndex>0){
                    slidePage.prev();
                }
            }
        }

        $('#next-page').on(tapOrClick,function(){
            slidePage.next();
        })
        $('#prev-page').on(tapOrClick,function(){
            slidePage.prev();
        })

        $('#pagination a').on(tapOrClick,function(){
            slidePage.index($('#pagination a').index($(this))+1);
        })


        $('#music').on(tapOrClick, function() {
            $(this).toggleClass('play');
            var audio = document.getElementById('audio');
            if (audio.paused) {
                audio.play()
            } else {
                audio.pause()
            }
        });
        $('#slidePage-container').on('touchmove', function(e) {
            e.preventDefault()
        });
        $(opt.pageContainer).on({
            'swipeUp':  function () {
                slidePage.next();
            },
            'swipeDown':  function () {
                slidePage.prev();
            }
        });
        $(opt.pageContainer).on('transitionend webkitTransitionEnd', function(event) {
            if(after){
                opt.after($(event.target).index()+1);
                after=false;
            }
        })
    }
})();