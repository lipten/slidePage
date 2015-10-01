(function() {
    var opt = {
        'after': function() {},
        'before': function() {},
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
            orderStep(item.next());
            obj.nextSlide(item);
            opt.before(item.index()+1);
        } else {
            obj.showSlide(item)
        }
    }
    function prevSlide(item) {
        if (item.prev().length) {
            currentItem = item.prev();
            orderStep(item.prev());
            obj.prevSlide(item);
            item.prev().prev().css('-webkit-transform', 'translate3d(0px, -100%, 0px)');
            opt.before(item.index()+1);
        } else {
            obj.showSlide(item)
        }
    }
    function initDom(opt) {
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
    function orderStep(dom) {
        after=true;
        var steps = $(dom).find('.step');
        steps.forEach(function(item) {
            var time = $(item).attr('data-delay') || 100;
            setTimeout(function() {
                $(item).removeClass('hide')
            }, time)
        })
    }
    function initEvent(opt) {
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
                after=false;
            }

        })
    }
})();