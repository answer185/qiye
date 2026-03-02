---
toc: content
group: 
  title: 前端基础
  order: 4
order: 4
---

# Grid布局
## Grid布局是什么
网格布局（Grid）是将网页划分成一个个网格单元，可任意组合不同的网格，轻松实现各种布局效果，也是目前CSS中最强大布局方案。

**与flex的区别**
Flex是针对轴线位置进行布局，可以看作是一维布局。而Grid针对行和列产生的单元格，可以看作二维布局。

## 基本概念
Grid的布局的相关概念如下：
- 容器：使用Grid布局的元素称为容器
- 项目：所有的直系子元素称为项目
- 行： 容器的水平区域
- 列：容器的垂直区域
- 网络线：划分网络的线。正常情况下，n行有n+1条水平网格线，m列有m+1要垂直网络线。
- 单元格：行和列的交叉区域。正常情况下，n行和m列有n * m 个单元格。

## 容器属性
- grid-template-columns：定义每一列的列宽
- grid-template-rows：定义每一行的行高
- grid-template-area：设定每个单元格的名称
- column-gap：列与列的间隔（列间距）。
- row-gap：行与行的间隔（行间距）
- gap属性是grid-column-gap和grid-row-gap的合并简写形式。如设置一个值则 列间距 = 行间距。
- grid-auto-flow： 定义单元格的排列顺序和方式，类似flex的flex-direction
- justify-items：设置单元格内容的水平位置
- align-items：设置单元格内容的垂直位置
- place-items：align-items属性和justify-items属性的合并简写形式。如果省略第二个值，则浏览器认为与第一个值相等。
- justify-content：整个内容区域在容器里面的水平位置
- align-content：整个内容区域的垂直位置
- place-content：align-content属性和justify-content属性的合并简写形式。
- grid-auto-columns：定义容器中多余网格的列宽
- grid-auto-rows：定义容器中多余网格的行高
- grid-template：是 grid-template-columns、grid-template-rows、grid-template-areas 这三个属性的简写形式。
- grid: 是grid-template-rows、grid-template-columns、grid-template-areas、 grid-auto-rows、grid-auto-columns、grid-auto-flow 这六个属性的简写形式。

### grid-template-columns、 grid-template-rows
设置列宽和行高，如：
```css
.container {
  display: grid;
  grid-template-columns: 50px 100px 50px;
  grid-template-rows: 50px 100px 50px;
}
```
表示这个gird为3行3列，3列的宽度分别为：50px、100px及50px。3行的高度为：50px、100px及50px。
其值除了px外，还可以是：
- 百分比：如grid-template-columns: 25% 25% 25% 25%;及grid-template-rows: 50% 50%;
- repeat()函数：对与相同的值，可以使用repeat来简写，如repeat(4, 25%)，第一个参数为次数，第二个参数为值
- fr：fraction 的缩写，意为"片段"，用与表示比例关系，如grid-template-columns: 1fr 2fr 1fr;表示第1列和第3列宽度相同，第2列是它们的两倍。
- minmax()函数：设置长度范围，参数为最小值和最大值，如：grid-template-columns: 1fr 1fr minmax(100px, 1fr);
- auto: 表示由浏览器自己决定长度。
- auto-fill: 自适应
- auto-fit: 自填充，一般用来实现自适应布局

**特殊值：网格线名称**
使用方括号指定每一根网络线的名称，以提高代码的可读性，如：
```css
.grid-container {
  display: grid;
  grid-template-columns: [main-start] 1fr [content-start] 2fr [content-end] 1fr [main-end];
}
```

### grid-template-area
用于定义网格区域名称。如
```css
.container {
 grid-template-columns:50px 50px 50px;
 grid-template-rows: 50px 50px 50px;
 grid-template-areas: 'a b c'
                      'd e f'
                      'g h i';
}
```

### 间距相关：column-gap、row-gap、gap
如：
```css
.container {
  grid-row-gap: 30px;
  grid-column-gap: 20px;
}
```
表示行间距为30px,列间距为20px。
gap是二者的合并写法，第一值为row-gap,第二个值为coloum-gap。

### grid-auto-flow
其值有row和column，分别表示：
- row:先行后列
- column: 先列后行
- row dense：先行后列，尽量紧密排满，针对有占多个单元格的情况
- column desn: 先列后行，尽量紧密排满，针对有占多个单元格的情况

### 单元格内容位置相关：justify-items、align-items、place-items
justify-items属性设置单元格内容的水平位置，align-items属性设置单元格内容的垂直位置。
其值有：
- start: 左对齐
- end: 右对齐
- center: 居中对齐
- stretch: 拉伸，占满单元格的整个宽度
如
```css
.container {
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
}
```
place-items上面二者的简写形式。
```css
place-items: <align-items> <justify-items>;
place-items: start end;
```

### 内容区域位置相关：justify-content、align-content、place-content
justify-content属性是整个内容区域在容器里面的水平位置（左中右及空白分配），align-content属性是整个内容区域的垂直位置（上中下及空白分配）。其效果跟Flex布局一样。其值有：
- start: 网格整体靠左/上对齐（LTR布局时）
- end: 网格整体靠右/下对齐（LTR布局时）
- center: 网格整体水平/垂直居中
- stretch: 网格轨道拉伸以填满容器（前提是轨道尺寸未固定）
- space-around: 水平/垂直方向上均匀分配空间
- space-between: 首尾轨道靠边，中间均匀分配
- space-evenly： 所有轨道之间及首尾空间均匀分配
如
```css
.container {
  display: grid;
  grid-template-columns: 100px 100px;
  grid-template-rows: 100px 100px;
  width: 500px;
  height: 500px;
  
  /* 水平方向居中 */
  justify-content: center;
  
  /* 垂直方向均匀分配空间 */
  align-content: space-evenly;
}
```
place-content属性是align-content属性和justify-content属性的合并简写形式。
```css
place-content: <align-content> <justify-content>
```

### 多余元素相关：grid-auto-columns、grid-auto-rows
定义容器中多余网格的列宽、行高。比如，网格设置了2行3列，但项目元素一共有8个，语法格式如下：
```css
.container {
  grid-template-columns:50px 50px 50px;
  grid-template-rows: 50px 50px ;
}
```
### grid-template
该属性是 grid-template-columns、grid-template-rows、grid-template-areas 这三个属性的简写形式。
格式如下：
```css
grid-template: none | 
              [ <grid-template-rows> / <grid-template-columns> ] |
              [ <grid-template-areas> [ <grid-template-rows> / <grid-template-columns> ]? ];
```
示例：
```css
/* 定义行和列 */
.container {
  grid-template: [row1-start] 100px [row1-end row2-start] 200px [row2-end] / 
                 [col1-start] 1fr [col2-start] 1fr [col-end];
}

/* 定义区域、行和列 */
.container {
  grid-template: 
    "header header header" 80px
    "nav    main   aside"  1fr
    "footer footer footer" 60px
    / 200px 1fr 150px;
}

/* 等同于 */
.container {
  grid-template-areas: 
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-rows: 80px 1fr 60px;
  grid-template-columns: 200px 1fr 150px;
}
```
### grid
该属性是grid-template-rows、grid-template-columns、grid-template-areas、 grid-auto-rows、grid-auto-columns、grid-auto-flow 这六个属性的简写形式。
其语法格式如下：
```css
grid: none | 
      [ <grid-template> ] |
      [ <grid-template-rows> / [ <grid-auto-flow> [ <grid-auto-rows> [ / <grid-auto-columns> ]? ]? ]? ] |
      [ [ <grid-auto-flow> [ <grid-auto-rows> [ / <grid-auto-columns> ]? ]? ] / <grid-template-columns> ];
```
示例：
```css
/* 只定义模板 */
.container {
  grid: 100px 200px / 1fr 1fr;
}

/* 定义模板和自动流 */
.container {
  grid: auto-flow dense / 1fr 1fr;
}

/* 完整示例 */
.container {
  grid: 
    [row1-start] "header header header" 80px [row1-end]
    [row2-start] "nav    main   aside"  1fr  [row2-end]
    [row3-start] "footer footer footer" 60px [row3-end]
    / 200px 1fr 150px;
}

/* 等同于 */
.container {
  grid-template-areas: 
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-rows: [row1-start] 80px [row1-end row2-start] 1fr [row2-end row3-start] 60px [row3-end];
  grid-template-columns: 200px 1fr 150px;
}
```
## 项目属性
### 项目位置相关属性
- grid-column-start：定义项目左边框所对齐的垂直网格线
- grid-column-end：定义项目右边框所对齐的垂直网格线。
- grid-column：是grid-column-start和grid-column-end的简写形式 （start / end）
- grid-row-start：定义项目上边框所对齐的水平网格线。
- grid-row-end：定义项目下边框所对齐的水平网格线。
- grid-row：是grid-row-start和grid-row-end的简写形式 （start / end）
如：
```css
.item-1 {
  grid-column-start: 2;
  grid-column-end: 4;
  
  /* 简写 */
  grid-column: 2 / 4;
}
.item-2 {
  grid-row-start: 1;
  grid-row-end: 4;
  
  /* 简写 */
  grid-row: 1 / 4;
}
```
其值为对应的网络线名称。
**另一个值为span**，表示跨越，后面会跟上一个数字，表示跨跃多少个网格。
```css
.item-1 {
  grid-column-start: span 2;
}
/*1号项目的左边框距离右边框跨越2个网格。*/
.item-1 {
  grid-column-end: span 2;/*与上面效果相同*/
}
```

### 内容布局相关
- justify-self：定义项目在单元格区域内的水平位置（左中右）
- align-self：定义项目在单元格区域内的垂直位置（上中下）
- place-self：同时定义项目在单元格区域内的水平和垂直位置，是 align-self 和 justify-self 的简写。若省略第二个值，默认两个值相等。

其值有：
- start：对齐单元格的起始边缘。
- end：对齐单元格的结束边缘。
- center：单元格内部居中。
- stretch：拉伸，占满单元格的整个宽度（默认值）。

语法格式：
```css
.item {
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
  place-self: <align-self> <justify-self>;
}
```
### 其他
- grid-area: 属性指定项目放在哪一个区域，其值为对应的区域名称。