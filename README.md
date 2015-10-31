
# slidePage
Demo:http://lipten.link/projects/slidePage/demo.html?page=1

###-update-
新增url参数pege跳转指定页，优先于index参数.

## Doc
slidePage.init(options);

options:(default)

<pre>
{
    'index' : 1,
    'before' : function(index){},
    'after' : function(index){},
    'useArrow' : true,
    'useAnimation' : true,
    'useMusic' : {
        'autoPlay' : true,
        'loopPlay' : true,
        'src' : 'http://mat1.gtimg.com/news/2015/love/FadeAway.mp3'
    }
 };
</pre>
####index
初始进入的索引页面，值为1时从第一页开始，默认为1

####before
触发页面滚动前的回调，参数index为滚动前的页面索引号
####after
触发页面滚动后的回调，参数index为滚动后的页面索引号
####useArrow
使用自带样式的下箭头提示图标
####useAnimation
开启或关闭动画
####useMusic
使用音乐，并有音乐图标提示用户控制播放

###使用动画
<pre>
&lt;div class="step slideRight" data-delay="1300"&gt;&lt;/div&gt;
</pre>
在想要动画控制的元素上加上step类，并加上css动画类名即可使用动画，data-delay属性控制动画延时播放(默认为100毫秒);
此项目还为您准备了一套css动画：page-animation.css，可自由更改或添加您想要的动画，

####动效列表:
<pre>
[
    fadeIn,
    fadeFlash,
    flaxLine,
    borderFlash,
    forceDown,
    slideLeft,
    slideRight,
    slideUp,
    slideDown,
    rotateIn,
    zoomIn,
    heartBeat,
    rollInLeft,
    rollInRight
]
</pre>
