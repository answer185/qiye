---
toc: content
group: 
  title: React基础
  order: 3
order: 3
---
# React事件与原生DOM事件的区别
React 事件和原生 DOM 事件在底层实现、使用方式等方面存在诸多不同，以下为你详细阐述它们的主要区别：
 
## 事件绑定形式
 
- 原生 DOM 事件：可以采用两种方式绑定事件。一种是直接在 HTML 标签属性中赋值，例如
```html 
<button onclick="handleClick()">点击</button>
```
另一种是借助 JavaScript 方法，像  addEventListener ，如  element.addEventListener('click', handleClick) 。
 
- React 事件：遵循驼峰命名规则，以属性形式绑定事件处理函数，例如  
```html
<button onClick={handleClick}>点击</button>
```
并且，React 会统一对所有事件进行管理。
 
## 事件对象特性
 
- 原生 DOM 事件：在事件处理函数中，直接接收浏览器提供的原生事件对象  event ，该对象包含了特定于浏览器的属性，例如  event.originalTarget 。
 
- React 事件：React 会将原生事件封装成一个跨浏览器的合成事件对象  SyntheticEvent 。这个对象提供了标准化的属性和方法，比如  event.target 。同时，React 采用事件池技术来复用事件对象，以提高性能。不过，需要注意的是，在异步操作中访问事件对象可能会出现问题。
 
## 事件冒泡机制
- 原生 DOM 事件：事件会从触发元素开始，依次向上传播到祖先元素，例如从  div  到  body 。可以通过调用  event.stopPropagation()  来阻止事件的传播。

- React 事件：React 模拟了事件冒泡机制，但在某些情况下，比如在  StrictMode  中，事件传播的行为可能会有所不同。它同样支持  stopPropagation()  方法，但需要注意的是， stopPropagation()  并不能阻止事件的默认行为。
 
## 默认行为处理
- 原生 DOM 事件：有两种方式可以阻止事件的默认行为。一种是直接在事件处理函数中返回  false ，例如  onclick="return false" ；另一种是调用  event.preventDefault() 。
 
- React 事件：必须显式地调用  event.preventDefault()  才能阻止事件的默认行为，返回  false  是无效的。
 
## 兼容性表现
 
- 原生 DOM 事件：不同的浏览器对事件的实现可能存在差异，开发者需要自行处理兼容性问题，例如  event.preventDefault()  和  returnValue  的不同使用方式。
 
- React 事件：React 会统一处理跨浏览器的兼容性问题，开发者无需额外编写代码来解决不同浏览器之间的差异。
 
## 事件委托机制
 
- 原生 DOM 事件：如果要为多个子元素绑定事件，通常需要手动进行事件委托，例如将事件绑定到父元素上，然后通过  event.target  来判断触发事件的元素。
 
- React 事件：React 内部自动采用了事件委托机制，将事件统一绑定在根节点（如  document ）上，这样可以减少事件监听器的数量，从而提高性能。
 
## 总结
 
React 的事件系统通过合成事件对原生 DOM 事件进行了封装，在保证跨浏览器兼容性的同时，还优化了性能。开发者在使用 React 事件时，需要遵循其特定的规则，例如使用驼峰命名、通过  event.preventDefault()  阻止默认行为等。虽然原生事件的操作更加灵活，但在实际开发中，React 事件能提供更简洁、统一的开发体验。
