---
toc: content
group: 
  title: React开发
  order: 3
order: 3
---
# Tailwind CSS 使用

## 一、简介
### 1.1 原子化CSS
Tailwind的每个类包含一个CSS特性，这种写法可以称为原子化。比如 flex 类，代表该元素的display为flex。在实际开发中，根据元素的需要，组合这些原子化的类。
### 1.2 与传统的最佳实践相矛盾
这种写法，与传统的做法相背离。通常我们会保持class的简洁，而将css的特性书写在相应的类中。Tailwindcss的写法虽然与此相矛盾，但是具有以下好处：
- 更快完成开发，无需花时间构思类名
- 更改更安全：向元素添加或删除类只会影响该元素。因此无需担心破坏其他页面。
- 维护旧项目更容易：更改内容只需要找到该元素并修改类。
- 代码更具可移植性：由于结构和样式在同一位置，可以轻松地复制和粘贴整个UI代码块。即使在不同的项目之间也是如此。
- CSS不再增长：由于实用程序类具有极高的可重用性，因此CSS不会随着项目的功能增加而增加。

### 1.3 与内联样式的区别
Tailwind的这种写法，与内联样式，从某种角度上看，它们差不多，但是相对来说，有以下优势：
- 使用约束进行设计：内联样式每个值都是一个数字，而实用程序类，可以选择样式，构建视觉一致的UI变得更容易。
- 悬停、聚焦和其他状态：内联样式不支持，但Tailwind通过状态谈何可以轻松使用程序的类来设置。
- 媒体查询：无法在内联样式中使用媒体查询，但Tailwind可以。

### 1.4 实现原理
Tailwind CSS 的工作原理是扫描所有 HTML 文件、JavaScript 组件以及任何其他模板中的类名，生成相应的样式，然后将其写入静态 CSS 文件。
也正因为此，我们不能使用合成方式的css，如以下代码：
```html
<div class="text-{{ error ? 'red' : 'green' }}-600"></div>
```
将会无法识别到text-red-600及text-green-600的类
需要使用完整的类名：
```html
<div class="{{ error ? 'text-red-600' : 'text-green-600' }}"></div>
```
这个解析和构建的过程是基于PostCSS实现的，它本质上是一个PostCSS插件。对扫描到的类，生成对应的CSS样式。
## 二、基础使用
### 2.1 Nextjs项目里的Tailwindcss配置
使用Nextjs的CLI工具 create-next-app创建的项目，可以选择支持Tailwindcss，当前默认使用Tailwindcss 4.x，与之前的版本不同，4.x已经内置支持了autoprefixer。
global.css中的导入，改为：
```css
@import "tailwindcss";
```
不再是：
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
### 2.2 编辑器环境设置
**vscode插件**
安装Tailwind css intellisense插件。安装后，鼠标放到相应类上，可以查看Tailwindcss类的代码，
**prettier插件**
安装prettier-plugin-tailwindcss插件，它的作用是对类名进行排序，方便阅读。

### 2.3 基础单位
Tailwindcss内部是使用rem作为单位的，每个1代表0.25rem，比如m-2，表示margin: 0.5rem，即8px，gap-4:表示1rem，即16px。
如果是负数，在类的前面加-号，比如-m-2表示：margin: -0.5rem。

### 2.4 核心概念
**utility classes（实用类）**
即Tailwindcss内置的各种类，比如 flex， bg-red-500等。
这些类通常代表着一个css特性。可以组合使用这些类来设置样式。
**悬停、焦点等其他状态**
Tailwindcss内置了很多状态，其语法格式是：状态名称+冒号+相应的实用类来有条件地应用实用类。比如：
> hover:bg-sky-700
在悬停到该元素时，使用bg-sky-700。
其生成的代码：
```css
.hover\:bg-sky-700:hover {
  background-color: #0369a1;
}
```
常用的有：hover、focus、active、first、last、odd、even、required、disabled、before、after等。
可以多个状态联合使用，如：
> hover:active:focus:bg-fuchsia-600
**响应式设计**
默认情况下，有5种断点：
暂时无法在飞书文档外展示此内容
使用时，可以根据不同的断点条件，设置不同的类，如：
```html
<img class="w-16 md:w-32 lg:w-48" src="..." />
```
这里需要注意的，Tailwind是移动优先的设计，即我们的默认CSS应该优先移动端，然后再根据断点条件，当大于某个尺寸时，再做针对性设计。其中sm指的是大于40rem(即640px)尺寸的屏幕，并不是特指小屏幕。
**Dark mode：暗黑模式**
Tailwind 通过 dark:来支持暗黑模式，可以针对dark模式，应用相应的实用类，如：
```html
<html data-theme="dark">
  <body>
    <div class="bg-white dark:bg-black">
      <!-- ... -->
    </div>
  </body>
</html>
```
**主题变量**
Tailwind支持通过 @theme指令来设置css变量，可以修改Tailwind的内置变量，也可以新增新的变量，如
```css
@theme {
  --font-poppins: Poppins, sans-serif;
}
```
**Colors：颜色**
Tailwind CSS 包含一个开箱即用的丰富、美丽的调色板，由专业设计师精心制作，适用于各种不同的设计风格。
默认调色板中的每种颜色都包含 11 个等级，其中 50 最亮，950 最暗。颜色由浅到深。
颜色可以与bg(背景)，text(文本)等与颜色相关的属性组合，作为实用类使用。如
bg-sky-500，将背景设置为暗度为500的sky颜色。

还需要注意与透明度写法的区别，透明度使用/[百分比]的语法。如
bg-sky-500/30，表示 30%的透明度。
添加自定义样式
最常用的自定义样式有两种：
- @themes指令，设置相应的变量，如：
```css
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-200: oklch(0.98 0.04 113.22);
  --color-avocado-300: oklch(0.94 0.11 115.03);
  --color-avocado-400: oklch(0.92 0.19 114.08);
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --color-avocado-600: oklch(0.53 0.12 118.34);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  /* ... */
}
```
- 使用[]语法，传入自定义的值。
```html
<div class="top-[117px]">
  <!-- ... -->
</div>
```
### 检测源文件中的类
Tailwind会扫描项目中的实用类，然后根据实际使用的类生成所有必要的CSS。
所以我们在项目中不能使用动态的类名。
```html
<div class="text-{{ error ? 'red' : 'green' }}-600"></div>
```
可以通过@source指令注册一些额外的路径。
```css
@import "tailwindcss";
@source "../node_modules/@acmecorp/ui-lib";
```
也可以在import后，指定路径：
```css
@import "tailwindcss" source("../src");
```

或者使用 @source not 忽略特定路径
```css
@import "tailwindcss";
@source not "../src/components/legacy";
```
**函数和指令**
函数：
- --alpha()，调整颜色的不透明度。
```css
.my-element {
  color: --alpha(var(--color-lime-300) / 50%);
}
```
编译后的css:
```css
.my-element {
  color: color-mix(in oklab, var(--color-lime-300) 50%, transparent);
}
```
- --spacing()
使用 --spacing() 函数根据您的主题生成间距值：
```css
.my-element {
  margin: --spacing(4);
}
```
编译后的class:
```css
.my-element {
  margin: calc(var(--spacing) * 4);
}
```
这对于任意值也很有用，特别是与 calc() 结合使用时：
```css
<div class="py-[calc(--spacing(4)-1px)]">
  <!-- ... -->
</div>
```

指令：
- @import : 内联导入 CSS 文件，包括 Tailwind 本身
- @theme: 定义项目的自定义设计标记，例如字体、颜色和断点。
- @source: 明确指定 Tailwind 自动内容检测未捕获的源文件
- @utility: 向项目添加自定义实用程序，这些实用程序可与 hover、focus 和 lg 等变体配合使用
- @variant: 将 Tailwind 变体应用于 CSS 中的样式
- @custom-variant: 在项目中添加自定义变体
- @apply: 将任何现有的实用程序类内联到自己的自定义 CSS 中
- @reference: 引用某css文件，一般在Vue的<style>模块中使用。
### 2.5 Tailwind实用类使用
使用Tailwind书写的class会很长，刚开始看可能会很不习惯，甚至看不懂这些组合之后，这个元素到底是什么样的呈现。以下是一些建议：
- 在使用之前一定要阅读下文档上的核心概念部分，这部分类似Tailwind为css扩展的新语法，了解好规则后，就更容易理解那些类。
- 从css属性的方面去理解类，看着很多，其实有些是因为颜色等导致列出很长的内容。理解好那些前缀的意思，基本上就可以快速上手。
- 使用prettier-tailwind-plugin对类进行排序，这样阅读起来更流畅。

## 三、高级使用
### 3.1 变量设置
根据项目的设计系统，我们需要考虑：
- 主品牌色和次品牌色语义化命名。
- 自定义字体和大小。
- 自定义断点的设置。
### 3.2 复杂的选择器
当需要在父组件对子元素进行样式设置时，经常需要用到选择器。以一个例子来说明用法。以下是代码：
```js
<Codeblock
    codeLanguage={codeLanguage}
    allowCollapse={false}
    className="[&>div]:-m-2 [&>div]:rounded-none [&_*]:!text-xs [&_pre]:p-4"
    fromHomepage
>
    {code}
</Codeblock>
```
这里的className表示的是:
- [&>div]:-m-2: Codeblock下的所有直接子div元素，设置-m-2类，即-0.5rem外边距。
- [&>div]:rounded-none：Codeblock下的所有直接子div元素移除圆角
- [&_*]:!text-xs： 所有子元素的字体大小为12px。
- [&_pre]:p-4：所有内部的<pre>元素添加p-4类，即添加1rem的内边距。

### 3.3 clsx及tailwind-merge
**背景**
1. React项目中，我们经常需要动态组合类名，当某个条件为true时增加某个class，这样可能会出现一些空值 ，undefined,false之类的冗余。
如：
```js
function Button({ isActive, isLarge }) {
  const className = `bg-blue-500 ${isActive && "bg-blue-700"} ${isLarge && "text-lg"}`;
  return <button className={className}>Click</button>;
}
```
2. 项目中，当符合某个条件时，我们希望使用新的class类来覆盖默认的class。但是Tailwind的优先级规则并不是按类的书写顺序，而是Tailwind里实际类的位置，在后面的类，会覆盖前面的类。比如：
```js
function Card({ className }) {
  return <div className={`p-4 bg-white ${className}`}>Content</div>;
}
// 使用时：<Card className="p-8 bg-gray-100" />
```
当传入p-8及bg-gray-100里，可能出现覆盖不了的情况。

**解决**
clsx：支持传入多个字符串参数或一个对象，根据条件显示相应的类，并过滤掉空值、undefined等无关的内容。
```js
import clsx from 'clsx';
// or
import { clsx } from 'clsx';

// Strings (variadic)
clsx('foo', true && 'bar', 'baz');
//=> 'foo bar baz'

// Objects
clsx({ foo:true, bar:false, baz:isTrue() });
//=> 'foo baz'

// Objects (variadic)
clsx({ foo:true }, { bar:false }, null, { '--foobar':'hello' });
//=> 'foo --foobar'

// Arrays
clsx(['foo', 0, false, 'bar']);
//=> 'foo bar'

// Arrays (variadic)
clsx(['foo'], ['', 0, false, 'bar'], [['baz', [['hello'], 'there']]]);
//=> 'foo bar baz hello there'

// Kitchen sink (with nesting)
clsx('foo', [1 && 'bar', { baz:false, bat:null }, ['hello', ['world']]], 'cya');
//=> 'foo bar hello world cya'
```
tailwind-merge: 主要解决tailwind类冲突的问题，根据顺序，去掉不必要的属性类。
如：
```js
import { twMerge } from "tailwind-merge";

twMerge("p-4 bg-white p-8 bg-gray-100"); 
// 输出："p-8 bg-gray-100"（自动移除冲突的 p-4 和 bg-white）
```
通常可以像shadcn/ui项目使用的那样。将这两个封装成一个工具函数：
```js
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 四、总结
虽然Tailwind有一定的学习成本，但是熟练使用后，能极大提高开发效率，同时减少css的体积，还可以降低css的维护成本和增强可移植性。
