---
toc: content
group: 
  title: 前端基础
  order: 4
order: 3
---

# Flex布局

**产生背景及作用**
网页布局传统的解决方案是基于盒状模型，依赖display + position 属性 + float属性
在一些特殊布局非常不方便，比如垂直居中

Flex布局可以简便，完整，响应式地实现各种页面布局，比之前更简单方便

## **一、Flex布局是什么**
Flex是Flexible Box的缩写，意为“弹性布局”，用来为盒状模型提供最大的灵活性。

任何一个容器都可以指定 为Flex布局

```css
.box {
    display: flex;
}
```

行内元素也可以 使用Flex布局

```css
.box {
    display: inline-flex;
}
```

Webkit内核的浏览器，必须加上 -webkit 前缀

```css
.box {
    display: -webkit-flex; /*Safari*/
    display: flex;
}
```

注意：设置Flex布局以后 ，子元素的float, clear 和 vertical-align属性将失效

## **二、基本概念**

*   采用Flex布局的元素，称为Flex容器（flex container）， 简称容器。
*   所有的子元素自动成为容器成员，称为Flex项目（flex item）, 简称项目
    ![flex基本概念](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015071004.png)
*   默认存在2根轴： 水平的主轴（main axis） 和垂直的交叉轴（cross axis）
*   main start: 主轴的开始位置（与边框的交叉点）
*   main end: 主轴的结束位置
*   cross start: 交叉轴的开始位置
*   cross end: 交叉轴的结束位置
*   main size: 项目默认沿主轴排列，单个项目点拨的主轴空间叫做main size
*   cross size: 占据的交叉轴空间

## **三、容器的属性**
有6个属性可以 设置在容器上

*   flex-direction
*   flex-wrap
*   flex-flow
*   justify-content
*   align-items
*   align-content

### *3.1 flex-direction:*
决定主轴的方向，（即项目的排列方向）。
```css
.box {
    flex-direction: row | row-reverse | column | column-reverse;
}
```
4个值的意思

*   row(默认值): 主轴为水平方向，起点在左端。
*   row-reverse: 主轴为水平方向，起点在右端。
*   column: 主轴为垂直方向 ，起点在上沿
*   column-reverse: 主轴为垂直方向，起点在下沿。

### *3.2 flex-wrap*
设置当一行排不下时，如何 换行
```css
.box {
    flex-wrap: nowrap | wrap | wrap-reverse;
}
```
3个值的意思

*   nowrap（默认） 不换行
*   wrap: 换行，第一行在上方
*   wrap-reverse: 换行，第一行在下方

### *3.3 fex-flow*
flex属性是flex-direction 和 flex-wrap的简写形式，默认是 row nowrap
```css
.box {
    flex-flow: <flex-direction> || <flex-wrap>;
}
```
### *3.4 justify-content*
定义了项目在主轴上的对齐方式
```css
.box {
    justify-content: flex-start | flex-end | center | space-between | space-around;
}
```
5个值的意思：

*   flex-start(默认值)： 左对齐
*   flex-end: 右对齐
*   center: 居中
*   space-between: 两端对齐，项目之间的间隔都 相等
*   space-around: 每个项目两侧的间隔相等。所以 项目之间的距离比项目与边框的间隔大一倍

### *3.5 align-items*
定义项目在交叉轴上如何对齐
```css
.box {
    align-items: flex-start | flex-end | center | baseline | stretch
}
```
5个值的意思

*   flex-start： 交叉轴的起点对齐
*   flex-end: 交叉轴的终点对齐
*   center: 交叉轴的中占对齐
*   baseline: 项目的第一行文字 的基线对齐
*   stretch(默认值）：如果项目未设置高度或设为auto,将占满整个容器的高度

### *3.6 align-content*
定义多根轴线的对齐方式，如果只有一行（只有一根轴线 ），该属性不起作用
```css
.box {
    align-content: flex-start | flex-end | center |
    space-between | space-around | stretch;
}
```
6个值的意思

*   flex-start: 与交叉轴的起点对齐
*   flex-end: 与交叉轴的终点对齐
*   center: 与交叉轴的中点对齐
*   space-between: 与交叉轴两端对齐， 轴线之间的间隔平均分布
*   space-around: 每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线 与边框的间隔大一倍
*   stretch(默认值)： 轴线占满整个交叉轴。

## **四、项目的属性**
有6个属性可以 设置在项目上

*   order
*   flex-grow
*   flex-shrink
*   flex-basis
*   flex
*   align-self

### *4.1 order*
定义 项目的排列顺序，数值越小越靠前
```css
.item {
    order: <integer>;
}
```
### *4.2 flex-grow*
在有剩余空间时，定义 项目的这么大比例
默认为0，即有剩余空间也不放大
```css
.item {
    flex-grow: <number>; 
}
```
如果所有项目的flex-grow属性都 为1，则它们将等分剩余空间。
如果 一个项目的flex-grow为2，其他 项目为1，则前者 占的剩余空间将比其他项目多一倍

### *4.3 flex-shrink*
当空间不足时，定义项目的缩小比例
默认为1 ，即：当空间不足时，项目将缩小
```css
.item {
    flex-shfink: <number>;
}
```
如果所有项目的flex-shrink属性都 为1 ，当空间不足时，都 将等比例缩小
如果 一个项目的flex-shrink属性为0，其他项目为1，则空间不足时，前者不缩小
负值对该属性无效

### *4.4 flex-basis*
定义 了在分配 多余空间之前 ，项目占据的主轴空间（main size）
默认值 是auto,即 项目本来的大小
```css
.item {
    flex-basis: <length> | auto;
}
```
### *4.5 flex属性*
flex属性是flex-grow， flex-shrink和flex-basis简写
默认值 是 0 1 auto， 后两个属性可选
```css
.item {
    flex: none | [<flex-grow> <flex-shrink>? || <flex-basis>]
}
```
该属性有2个快捷值： auto(1 1 auto) 和 none(0 0 auto)
建议优先使用这个 属性，而不是单独写有一个分享的忏悔，因为 浏览器 会推算相关值 。

### *4.6 align-self*
允许单个项目与其他 项目不一样的对齐方式，可覆盖 align-items
默认值 为auto,表示 继承父元素的align-items属性
如果idme父元素，则等同于stretch.
```css
.item {
    align-self: auto | flex-start | flex-end | center | baseline | stretch
}
```
除auto外，其他值与align-items相同
