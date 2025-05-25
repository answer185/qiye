---
toc: content
group: 
  title: React基础
  order: 3
order: 4
---
# setState
在React中， setState 是用于更新组件状态的重要方法，它主要做了以下几件事情：
 
## 更新状态
 setState 的核心作用是更新组件的状态。它接收一个新的状态值或者一个根据当前状态计算新状态的函数。当调用 setState 时，React会将新的状态与当前状态进行合并，然后触发组件的重新渲染。例如：
```js
this.setState({ count: this.state.count + 1 });
```

上述代码中， count 状态值增加了1。

## 批量更新
React会对 setState 进行批量更新优化。在同一事件循环内，多个 setState 调用会被合并成一次更新，以减少不必要的渲染。比如在一个 click 事件处理函数中多次调用 setState ，React会等事件处理函数执行完后，统一进行状态更新和渲染，提高性能。

## 触发重新渲染
状态更新后，React会根据新的状态重新计算组件的虚拟DOM。然后将新的虚拟DOM与旧的虚拟DOM进行对比，通过Diff算法找出差异，只更新实际发生变化的DOM节点，高效地更新真实DOM，以反映最新的状态。

## 生命周期调用
在 setState 导致的更新过程中，React会按照特定顺序调用组件的生命周期方法，如 shouldComponentUpdate 、 componentWillUpdate 、 render 、 componentDidUpdate 等，开发者可以在这些方法中执行一些与更新相关的逻辑。

## 异步操作
setState 默认是异步的，这意味着在调用 setState 后，不能立即获取到更新后的状态值。因为React可能会将多个 setState 操作合并延迟执行。如果需要在状态更新后执行某些操作，可以使用 setState 的回调函数或者 componentDidUpdate 生命周期方法。