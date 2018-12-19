# slidePage

 > slidePage现已推出3.0, 吸取了上一版本[slidePage v2.1.1](https://github.com/lipten/slidePage/tree/v2) 的各种经验，弥补不足，与v2.1.1不同的是移除了对jquery和zepto的依赖，精简到只有一个js文件，优化了接口调用方式，更适合主流的前端框架，另外还有基于vue的插件版本[vue-slidePage](https://github.com/lipten/vue-slidePage)和基于react的插件版本[react-slidePage](https://github.com/lipten/react-slidePage)

### Demo:
* [simple](http://lipten.link/projects/slidePage3/examples/simple.html)
* [animated](http://lipten.link/projects/slidePage3/examples/animated.html)
* [scroll](http://lipten.link/projects/slidePage3/examples/scroll.html) 
* [custom](http://lipten.link/projects/slidePage3/examples/custom.html) 
* [fullFeatured](http://lipten.link/projects/slidePage3/examples/fullFeatured.html)

### Featured
slidePage3 特别适合主流前端框架开发，无任何依赖库，源代码只有12kb，Gzip压缩后仅有2.4k, 接口符合插件具有的初始化、销毁、重载的方法，适配PC和移动端，具有单屏内容滚动、手动播放动画、动态重绘等特色功能，具体查看完整示例: [fullFeatured](http://lipten.link/projects/slidePage3/examples/fullFeatured.html)

### Documentation:
* [Usage](#usage)
  * [Install slidePage](#install-slidepage)
  * [Including files](#including-files)
  * [Required HTML structure](#required-html-structure)
  * [Initialization](#initialization)
* [Configuration](#configuration)
* [Options](#options)
* [Using Animation](#using-animation)
* [Methods](#methods)
  * [slidepage.slideNext()](#slidepageslidenext)
  * [slidepage.slidePrev()](#slidepageslideprev)
  * [slidepage.slideTo(page)](#slidepageslidetopage)
  * [slidepage.slideFile(page)](#slidepageslidefilepage)
  * [slidepage.destroy()](#slidepagedestroy)
  * [slidepage.update()](#slidepageupdate)


## Usage

### Including files
```
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/lipten/slidePage/dist/slidePage.min.css">

<script type="text/javascript" src="<script src="https://cdn.jsdelivr.net/gh/lipten/slidePage/dist/slidePage.min.js"></script>
```

### Required HTML structure
```
<div class="slide-container" id="slide-container">
    <div class="slide-page page1">
      <div class="container">
        <h2>page1</h2>
        <p>page1 content</p>
      </div>
    </div>
    <div class="slide-page page2">
      <div class="container">
        <h2>page2</h2>
        <p>page2 content</p>
      </div>
    </div>
</div>
```
您可以查看完整examples里的html文件结构 [fullFeatured.html](https://github.com/lipten/slidePage/blob/master/examples/fullFeatured.html)

### Initialization
```
new slidePage()
```

## Configuration
```
var slidepage = new slidePage({
    slideContainer: '#slide-container',
    slidePages: '.slide-item',
    page: 1,
    refresh: true,
    useWheel: true,
    useSwipe: true,
    useAnimation : true,

    // Events
    before: function(origin,direction,target){},
    after: function(origin,direction,target){},
 });
```
## Options
> 在slidePage中，page指的是每一次全屏滚动的一屏，也可以理解为每一屏对应的页码，必须是1以上的整数

<table>
  <thead>
  <tr>
    <th>name</th>
    <th>type</th>
    <th>default</th>
    <th>description</th>
  </tr>
  </thead>
  <tbody>
    <tr>
      <td>slideContainer</td>
      <td>String|Element</td>
      <td>'.slide-container'</td>
      <td>指定slidePage要运行的容器选择器或元素</td>
    </tr>
    <tr>
      <td>slidePages</td>
      <td>String|NodeList|HTMLCollection</td>
      <td>'.slide-page'</td>
      <td>指定`slideContainer`容器里每个page的选择器或元素</td>
    </tr>
    <tr>
      <td>page</td>
      <td>Number</td>
      <td>1</td>
      <td>首次进入的page页码</td>
    </tr>
    <tr>
      <td>useAnimation</td>
      <td>Boolean</td>
      <td>true</td>
      <td>是否开启动画</td>
    </tr>
    <tr>
      <td>refresh</td>
      <td>Boolean</td>
      <td>true</td>
      <td>每次滚动进入是否重新执行动画</td>
    </tr>
    <tr>
      <td>useWheel</td>
      <td>Boolean</td>
      <td>true</td>
      <td>是否开启鼠标滚轮滑动</td>
    </tr>
    <tr>
      <td>useSwipe</td>
      <td>Boolean</td>
      <td>true</td>
      <td>是否开启移动端触控滑动</td>
    </tr>
  </tbody>
</table>

## Events

<table>
  <thead>
  <tr>
    <th>name</th>
    <th>description</th>
  </tr>
  </thead>
  <tbody>
    <tr>
      <td>before</td>
      <td>每次全屏滚动前触发事件，回调三个参数(origin, direction, target)，分别是滚动前的page序号、方向('next'|'prev')、滚动后的page序号</td>
    </tr>
    <tr>
      <td>after</td>
      <td>每次全屏滚动后触发事件，回调三个参数(origin, direction, target)，参数释义同上</td>
    </tr>
  </tbody>
</table>

## Using Animation

> 为了方便示例用animate.css，动画效果可以自己实现

### Include animate.css
```
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@3.5.2/animate.min.css">
```

### HTML structure
```
<div class="step animated fadeIn" data-delay="1300"></div>;
```
在想要动画控制的元素上加上step类，并加上css动画类名即可使用动画，data-delay属性控制动画延时播放(默认为100毫秒);

#### 手动触发动画

```
<div class="lazy animated fadeIn"></div>
```
1. 在想要手动播放动画的元素上加上lazy类，并加上css动画类名即可使用动画，可以加上data-delay使触发时再延时播放;
2. 通过slidepage.slideFire(page)指定某一页的lazy动画触发播放。

## Methods

### slidepage.slideNext()
滑动定位到下一屏

### slidepage.slidePrev()
滑动定位到上一屏

### slidepage.slideTo(page)
传入page页码，滑动定位到对应的page

### slidepage.slideFile(page)
触发对应 page 的lazy手动动画

### slidepage.destroy()
销毁当前实例，移除所有事件恢复class属性值。

### slidepage.update(newSlidePages)
当html里的page发生变化时需要执行动态更新。

`newSlidePages`参数非必填，仅应对于初始化的时候`slidePages`参数传入的是`NodeList`或`HTMLCollection`时才需要在更新的时候再传一次变化后的DOM结构通知更新。

> 此方法非常适合现在流行的数据驱动型框架，当模型数据驱动改变pege的排列时，执行update可以起到更新的作用，可以先看示例源码了解：[custom.html](https://github.com/lipten/slidePage/blob/master/examples/custom.html)


## Contributing

### development
本地运行
```
npm install
npm run server
```
构建
```
npm run build
```
