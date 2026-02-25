---
toc: content
group: 
  title: React Basics
  order: 3
order: 1
---
# Differences Between JSX and JS

React's JSX syntax is an extension syntax of JavaScript that allows embedding HTML-like structures directly in JavaScript code. Although JSX is ultimately compiled to regular JavaScript (React.createElement calls), they have obvious differences in syntax rules, usage methods, and functional features. Here are their main differences:

## Syntax Extension
Regular JavaScript can only manipulate elements through DOM APIs like document.createElement, appendChild, or concatenate strings to generate HTML structures, for example:
```js
const div = document.createElement('div');
div.textContent = 'Hello World';
```
JSX directly writes HTML-like tags in JavaScript, for example:
```js
const element = <div>Hello World</div>;
```
JSX supports nested tags, attributes, and expressions, making it closer to HTML structure.

## Tags and Attributes
Regular JavaScript element attributes need to be set through DOM APIs, for example:
```js
const button = document.createElement('button');
button.setAttribute('disabled', ''); // Disable button
```
JSX directly uses attributes in tags, and some attribute names differ from HTML (such as class changed to className):
```js
<button disabled={true}>Click me</button>;
```
JSX supports expressions as attribute values (wrapped in {}), for example:
```js
<img src={imageUrl} alt="Example" />;
```

## Event Handling
Regular JavaScript binds events through addEventListener:
```js
button.addEventListener('click', () => {
  console.log('Clicked');
});
```
JSX event names use camelCase and directly bind functions:
```js
<button onClick={() => handleClick()}>Click me</button>;
```

## Conditional Rendering and Loops
Regular JavaScript needs to dynamically concatenate strings or manipulate DOM through logical judgment:

```js
let content;
if (isLoggedIn) {
  content = '<div>Welcome!</div>';
} else {
  content = '<div>Please login.</div>';
}
```
JSX directly uses JavaScript expressions in tags (like if, &&, ? :):
```js
{isLoggedIn ? <div>Welcome!</div> : <div>Please login.</div>}
```
Loops use the map method:
```js
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

## Compilation and Performance
Regular JavaScript runs directly without preprocessing.

JSX needs to be compiled to React.createElement calls through tools like Babel, ultimately generating JavaScript code. Although this adds a compilation step, JSX has higher readability and development efficiency.

## Summary
- Declarative syntax: More intuitively describes UI structure.
- Integration with JavaScript: Directly uses variables, functions, and logic in tags.
- Type safety: Reduces errors through React validation.
- Performance optimization: React internally optimizes JSX rendering efficiency.

Although JSX is not mandatory (React also supports pure JavaScript writing), it has become the standard syntax of the React ecosystem, greatly improving the development experience.
