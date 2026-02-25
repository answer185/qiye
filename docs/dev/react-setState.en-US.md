---
toc: content
group: 
  title: React Basics
  order: 3
order: 4
---
# setState

In React, setState is an important method for updating component state. It mainly does the following things:

## Update State
The core function of setState is to update component state. It receives a new state value or a function that calculates new state based on current state. When setState is called, React merges the new state with the current state, then triggers component re-rendering. For example:
```js
this.setState({ count: this.state.count + 1 });
```

In the above code, the count state value is increased by 1.

## Batch Updates
React optimizes setState through batch updates. Multiple setState calls within the same event loop will be merged into one update to reduce unnecessary renders. For example, if setState is called multiple times in a click event handler function, React will wait for the event handler function to complete, then uniformly perform state updates and rendering, improving performance.

## Trigger Re-rendering
After state updates, React will recalculate the component's virtual DOM based on the new state. Then it compares the new virtual DOM with the old virtual DOM, finds differences through the Diff algorithm, and only updates DOM nodes that actually changed, efficiently updating the real DOM to reflect the latest state.

## Lifecycle Calls
During the update process caused by setState, React will call component lifecycle methods in a specific order, such as shouldComponentUpdate, componentWillUpdate, render, componentDidUpdate, etc. Developers can execute some update-related logic in these methods.

## Asynchronous Operations
setState is asynchronous by default, which means you cannot immediately get the updated state value after calling setState. Because React may merge and delay multiple setState operations. If you need to execute certain operations after state updates, you can use setState's callback function or the componentDidUpdate lifecycle method.
