---
toc: content
group: 
  title: React基础
  order: 3
order: 1
---
# JSX与JS的区别
React 的 JSX 语法是 JavaScript 的扩展语法，它允许在 JavaScript 代码中直接嵌入类似 HTML 的结构。虽然 JSX 最终会被编译为普通 JavaScript（React.createElement 调用），但两者在语法规则、使用方式和功能特性上有明显区别。以下是它们的主要差异：
## 语法扩展
普通 JavaScript只能通过  document.createElement 、 appendChild  等 DOM API 操作元素，或者拼接字符串生成 HTML 结构，例如：
```js
const div = document.createElement('div');
div.textContent = 'Hello World';
```
JSX直接在 JavaScript 中书写类似 HTML 的标签，例如：
```js
const element = <div>Hello World</div>;
```
JSX 支持嵌套标签、属性和表达式，更接近 HTML 结构。

## 标签与属性
普通 JavaScript元素属性需要通过 DOM API 设置，例如：
```js
const button = document.createElement('button');
button.setAttribute('disabled', ''); // 禁用按钮
```
JSX直接在标签中使用属性，且部分属性名与 HTML 不同（如  class  改为  className ）：
```js
<button disabled={true}>Click me</button>;
```
JSX 支持表达式作为属性值（用  {}  包裹），例如：
```js
<img src={imageUrl} alt="Example" />;
```
## 事件处理
普通 JavaScript通过  addEventListener  绑定事件：
```js
button.addEventListener('click', () => {
  console.log('Clicked');
});
```
JSX事件名采用驼峰命名，直接绑定函数：
```js
<button onClick={() => handleClick()}>Click me</button>;
```
## 条件渲染与循环
普通 JavaScript需要通过逻辑判断动态拼接字符串或操作 DOM：

```js
let content;
if (isLoggedIn) {
  content = '<div>Welcome!</div>';
} else {
  content = '<div>Please login.</div>';
}
```
JSX直接在标签中使用 JavaScript 表达式（如  if 、 && 、 ? : ）：
```js
{isLoggedIn ? <div>Welcome!</div> : <div>Please login.</div>}
```
循环使用  map  方法：
```js
{items.map(item => <li key={item.id}>{item.name}</li>)}
```
## 编译与性能
普通 JavaScript直接运行，无需预处理。

jsx需要通过 Babel 等工具编译为 React.createElement 调用，最终生成 JavaScript 代码。虽然增加了编译步骤，但 JSX 的可读性和开发效率更高。

## 总结
- 声明式语法：更直观地描述 UI 结构。
- 与 JavaScript 融合：在标签中直接使用变量、函数和逻辑。
- 类型安全：通过 React 校验减少错误。
- 性能优化：React 内部优化了 JSX 的渲染效率。
尽管 JSX 不是必须的（React 也支持纯 JavaScript 写法），但它已成为 React 生态的标准语法，极大提升了开发体验。
