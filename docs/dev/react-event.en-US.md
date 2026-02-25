---
toc: content
group: 
  title: React Basics
  order: 3
order: 3
---
# Differences Between React Events and Native DOM Events

React events and native DOM events differ in underlying implementation, usage methods, and other aspects. Here are their main differences:

## Event Binding Forms

- Native DOM events: Can be bound in two ways. One is directly assigning values in HTML tag attributes, for example:
```html 
<button onclick="handleClick()">Click</button>
```
Another is using JavaScript methods like addEventListener, such as element.addEventListener('click', handleClick).

- React events: Follow camelCase naming rules, bind event handler functions as properties, for example:
```html
<button onClick={handleClick}>Click</button>
```
And React will uniformly manage all events.

## Event Object Characteristics

- Native DOM events: In event handler functions, directly receive the native event object event provided by the browser, which contains browser-specific properties, such as event.originalTarget.

- React events: React wraps native events into a cross-browser synthetic event object SyntheticEvent. This object provides standardized properties and methods, such as event.target. Meanwhile, React uses event pooling technology to reuse event objects for performance improvement. However, it should be noted that accessing event objects in asynchronous operations may cause problems.

## Event Bubbling Mechanism
- Native DOM events: Events propagate from the triggering element upward to ancestor elements, such as from div to body. Event propagation can be stopped by calling event.stopPropagation().

- React events: React simulates event bubbling mechanism, but in some cases, such as in StrictMode, event propagation behavior may differ. It also supports the stopPropagation() method, but note that stopPropagation() cannot prevent default event behavior.

## Default Behavior Handling
- Native DOM events: There are two ways to prevent default event behavior. One is directly returning false in the event handler function, such as onclick="return false"; another is calling event.preventDefault().

- React events: Must explicitly call event.preventDefault() to prevent default event behavior, returning false is invalid.

## Compatibility Performance

- Native DOM events: Different browsers may have differences in event implementation, developers need to handle compatibility issues themselves, such as different usage of event.preventDefault() and returnValue.

- React events: React uniformly handles cross-browser compatibility issues, developers don't need additional code to solve differences between browsers.

## Event Delegation Mechanism

- Native DOM events: If you need to bind events to multiple child elements, usually need to manually perform event delegation, such as binding events to parent elements, then determining the triggering element through event.target.

- React events: React internally automatically adopts event delegation mechanism, uniformly binding events to root nodes (such as document), which can reduce the number of event listeners and improve performance.

## Summary

React's event system wraps native DOM events through synthetic events, ensuring cross-browser compatibility while optimizing performance. When using React events, developers need to follow specific rules, such as using camelCase naming, preventing default behavior through event.preventDefault(), etc. Although native events are more flexible, in actual development, React events provide a more concise and unified development experience.
