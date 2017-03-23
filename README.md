# slidePage
Demo:http://lipten.link/projects/slidePage/demo.html


> slidePage 是一个简单却可以很强大的滚动插件，不提供各种花俏的UI组件，只提供实用的功能接口，方便二次开发。

### -update v2.1-
1.【实验性功能】加入移除页面和恢复被移除页面的methods(slidePage.remove()和slidePage.recover())。

2.加入npm包管理。

### Usage

#### 1、下载slidePage
npm安装
```
npm install slidePage
```
bower安装
```
bower install slidePage
```
或者克隆到本地
```
git clone https://github.com/lipten/slidePage.git
```


#### 2、引用相关文件
```
<link rel="stylesheet" type="text/css" href="slidePage.css">        //插件必须样式
<link rel="stylesheet" type="text/css" href="page-animation.css">   //动画样式，可自己编写
```

#### 3、引用js文件
```
<script src="//cdn.bootcss.com/zepto/1.1.6/zepto.min.js"></script>  //zepto.js或者jquery类库
<script type="text/javascript" src="slidePage.js"></script>         //slidePage主文件
<script type="text/javascript" src="slidePage-touch.js"></script>   //slidePage移动端触屏事件

//也可以直接引入一个压缩合并过的slidePage.min.js
```

#### 4、html结构
```
<div class="slidePage-container" id="slidePage-container">
    <div class="item page1">
        <h2>page1</h2>
        <div class="step step1 fadeIn" data-delay="1000"></div>
        <div class="step step2 fadeIn"></div>
    </div>
    <div class="item page2">
        <h2>page2</h2>
        <div class="step step1 slideRight" data-delay="1300"></div>
        <div class="step step2 slideLeft"></div>
        <div class="step step3 zoomIn"></div>
    </div>
</div>
```


#### 5、初始化代码
```
slidePage.init();
```

## Configuration

<pre>
slidePage.init({
    'index' : 1,
    'before' : function(index,direction,target){},
    'after' : function(index,direction,target){},
    'speed' : 700
    'refresh'  : true,
    'useWheel' : true,
    'useKeyboard' : true,
    'useAnimation' : true,
 });
</pre>


## Options
#### index
初始进入的索引页面，值为1时从第一页开始，默认为1
#### before
触发页面滚动前的回调，参数解释：`index` 为滚动前的页码，`direction` 为滚动方向('next'或'prev')，`target`为滚动后的页码
#### after
触发页面滚动后的回调，参数同上。
#### speed
页面过渡的动画时间，以毫秒为单位
#### refresh
每次滚动是否重新执行动画
#### useWheel
开启或关闭鼠标滚轮滑动
#### useKeyboard
开启或关闭键盘上下键控制滚动
#### useAnimation
开启或关闭动画

### Using Animation
<pre>
&lt;div class="step slideRight" data-delay="1300"&gt;&lt;/div&gt;
</pre>
在想要动画控制的元素上加上step类，并加上css动画类名即可使用动画，data-delay属性控制动画延时播放(默认为100毫秒);

<pre>
&lt;div class="lazy slideRight"&gt;&lt;/div&gt;
</pre>
1. 在想要手动播放动画的元素上加上lazy类，并加上css动画类名即可使用动画，可以加上data-delay触发时再延时播放(一般好像没这必要了);
2. 通过slidePage.fire(index)指定某一页的lazy动画触发播放。


----------


* 此项目还为您准备了一套css动画：page-animation.css，可自由更改或添加您想要的动画

动效列表:
<pre>
[
    fadeIn,                 //渐显动画
    fadeFlash,              //闪烁动画
    flaxLine,               //伸展线条(基于父容器的宽度伸到100%)
    borderFlash,            //闪烁边框(红色边框)
    forceDown,              //重力砸下的动画(不是弹跳动画)
    slideLeft,              //从左边渐现移动出现
    slideRight,             //从右边渐现移动出现
    slideUp,                //从上边渐现移动出现
    slideDown,              //从下边渐现移动出现
    rotateIn,               //旋转渐现出现
    zoomIn,                 //缩放渐显出现
    heartBeat,              //若隐若现
    rollInLeft,             //从左边旋转渐现
    rollInRight             //从右边旋转渐现
]
</pre>


## Method

#### slidePage.index(pageIndex)
pageIndex传入一个正整数作为页码跳转到指定页面(从1开始),不传值则返回当前页面的页码

#### slidePage.prev()
滚动上一页

#### slidePage.next()
滚动下一页

#### slidePage.fire(pageIndex)
触发指定页面的lazy动画，lazy动画用法详见 [Using Animation][2]

#### slidePage.remove(pageIndex，callback)
移除指定页面，第一个参数是指定页码，第二个参数是移除后的回调

#### slidePage.recover(pageIndex，callback)
恢复被移除的页面，第一个参数参数传入被移除前的页码。第二个参数是恢复后的回调函数

> 以此项目demo为例，实现从第四页向上滚动使第三页移除，移除后从第二页向下滚动使第三页恢复：
```
var removedPagination; //暂存删除后的页码元素
    slidePage.init({
        /*'index': 1,*/
        before:function(index,direction,target){
            if(direction=='next'){
                $('#pagination').find('a').removeClass('active').eq(index).addClass('active')
            }else if(direction=='prev'){
                $('#pagination').find('a').removeClass('active').eq(target-1).addClass('active')
            }
        },
        after:function(index,direction,target){
          if(direction=='next'){
            if (target-1 == 2) { //注意移除后的所有的页码顺序会发生改变，所以这里匹配的其实是第二页【实验性功能，容易出Bug】
              slidePage.recover(3, function(){
                // 恢复第三页后页码元素也做相应的恢复
                $('#pagination a').eq(2).before(removedPagination)
              })
            }
          } else if (direction=='prev') {
            if (target == 4) {
              slidePage.remove(3, function() {
                // 移除第三页后页码也做相应的移除
                removedPagination = $('#pagination a').eq(2).remove()
              })
            }
          }
        },
        'useAnimation': true,
        'refresh': true,
        'speed': false,
    });
```
---

## History


### -update v2.0-
1.支持单屏滚动条滚动，使内容不再局限于一屏的高度，适配移动端的触摸滚动与桌面端的鼠标滚轮滚动。

2.初始化的回调方法有所改动，废除了v1.1版本的next和prev函数，将它们融合到了before和after函数的参数中，并改进成更开放统一的参数。

3.废除useArrow参数，去掉箭头组件


### -update v1.2-
1.新增一个性化的功能，可以手动播放指定页面的动画元素(页面滚动不会自动触发)，只要把需要动画的元素的step类换成lazy（即不会自动触发动画的元素），然后在任意时刻调用[slidePage.fire(index)][1]触发指定页面的lazy动画即可，详见demo.html

2.修正FireFox浏览器的兼容性问题

### -update v1.1-
1.正式版之后的改版，为了在避免在项目中遇到UI组件混乱，实现清晰的功能划分，废除了一些绑定html结构的功能（分页组件、音乐组件）

2.初始化方法的参数开出多两个回调函数（next和prev）,可以自由的做二次开发，demo中利用这两个回调和methon实现了分页组件，下面有详细说明这两个参数。


### -update v1.0-
1.正式版，从0.6.2版本修复稳定。

### -update v0.6.2-
1.全面支持jquery和zepto！

2.将zepto-touch.js改造了一下，使jquery也能以同样的方式调用触屏事件;

3.将改造后的zepto-touch.js取名为slidePage-touch.js,并与主文件合并压缩成slidePage.min.js


### -update v0.6-
1.加入了分页组件。

2.开放了三个方法：slidePage.index()、slidePage.next()和slidePage.prev(),详情见文档;



### -update v0.5.2-
1.html结构有所改变：滚动的父容器除了加"slidePage-container"的class样式外还要加多个"slidePage-container"的id
```
<div class="slidePage-container" id="slidePage-container">
```

### -update v0.5.1-
1.去除了slidePage_Mobile版本(只有十行左右的区别，没必要)。

2.mobile版本的需求衍生成useWheel和useKeyboard两个参数来开关键盘事件和滚轮事件.

### -update v0.5-
1.兼容了桌面系统，使用鼠标滚轮或者键盘上下键即可全屏滚动。

### -update v0.4-
1.新增参数speed(页面过渡的动画时间，毫秒为单位)

2.修复refresh参数的bug.

### -update v0.3-
1.新增参数refresh(回滚的时候是否重新执行动画，默认为true)

2.修复无page参数的bug.

### -update v0.2-
1.新增url参数pege跳转指定页，优先于index参数.

2.已加入bower大军.


  [1]: https://github.com/lipten/slidePage#slidepagefirepageindex
  [2]: https://github.com/lipten/slidePage#using-animation
