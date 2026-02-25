---
toc: content
group: 
  title: React Basics
  order: 3
order: 5
---
# React Hooks Usage Summary

## What are Hooks
React Hooks are a way to use state and other React features in functional components, replacing traditional class components. Compared to class components, they can more conveniently reuse component logic and have more readable and maintainable code.

## Common Hooks
### useState
Used to add state to functional components. It allows you to have mutable state without using classes.
```js
import {useState} from "react"

enum CategoryType {
  FINANCE = "finance",
  TECHNOLOGY = "technology",
  COLLECTIBLES = "collectibles",
  SOCIAL = "social",
}

const [selectedCategory, setCategory] = useState<CategoryType>(
  CategoryType.FINANCE
)

const handleCategorySelect = (
  category: CategoryType,
  isMobile = false
): void => {
  setCategory(category)
}
```

### useEffect
Used to handle side effects (such as data fetching, subscriptions, or manual DOM modifications). It can replace lifecycle methods like componentDidMount, componentDidUpdate, and componentWillUnmount.
```js
// Replace componentDidMount
useEffect(() => {
  // Execute side effect operations
}, []);

// componentDidUpdate
useEffect(() => {
  // Execute side effect operations
}, [dependencies]);

// componentWillUnmount
// Clear timer
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Timer running...');
  }, 1000);

  return () => {
    clearInterval(timer); // Clear timer when component unmounts
  };
}, []);

// Cancel network request
useEffect(() => {
  const controller = new AbortController();
  const signal = controller.signal;

  fetch('https://api.example.com/data', { signal })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => {
      if (err.name === 'AbortError') {
        console.log('Request canceled');
      } else {
        console.error('Fetch error:', err);
      }
    });

  return () => {
    controller.abort(); // Cancel request when component unmounts
  };
}, []);

// Remove event listener
useEffect(() => {
  const handleScroll = () => {
    console.log('Window scrolled');
  };

  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll); // Remove listener on unmount
  };
}, []);

// Clean up websocket subscription
useEffect(() => {
  const socket = new WebSocket('wss://example.com/socket');

  socket.onmessage = (event) => {
    console.log('Message received:', event.data);
  };

  return () => {
    socket.close(); // Close WebSocket when component unmounts
  };
}, []);
```

### useReducer
Used for complex state logic management, similar to the reducer function in Redux. It's suitable for situations where state logic is relatively complex.
```js
import React, { useReducer } from 'react';

// 1. Define reducer function
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    default:
      throw new Error('Unknown action type');
  }
}

function Counter() {
  // 2. Use useReducer
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <h2>Count: {state.count}</h2>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}
```

### useRef
Mainly used to access DOM elements or store mutable values (won't trigger re-renders)
```js
// DOM operations
import React, { useRef } from 'react';

function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  
  const onButtonClick = () => {
    // `current` points to the mounted input element
    inputEl.current.focus();
  };
  
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

Store mutable values:
```js
function Timer() {
  const intervalRef = useRef();
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      console.log('Timer tick');
    }, 1000);
    
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  
  // ...
}
```

### useMemo
Used to memoize calculation results, returning cached results when dependencies haven't changed.
```js
import React, { useMemo } from 'react';

function ExpensiveCalculationComponent({ list }) {
  // Only recalculates when list changes
  const sortedList = useMemo(() => {
    console.log('Re-sorting...');
    return [...list].sort((a, b) => a.value - b.value);
  }, [list]); // Dependencies

  return (
    <ul>
      {sortedList.map(item => (
        <li key={item.id}>{item.value}</li>
      ))}
    </ul>
  );
}
```

Applicable situations:
- Sorting/filtering operations on large lists
- Complex mathematical calculations
- Formatting/converting large amounts of data
- Avoiding unnecessary child component re-renders (combined with React.memo)

### useCallback
Used to memoize callback functions, avoiding child component re-renders caused by function recreation.
```js
import React, { useState, useCallback } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // Use useCallback to cache function
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Empty dependencies means function never changes

  return (
    <div>
      <p>Count: {count}</p>
      <ChildComponent onClick={handleClick} />
    </div>
  );
}

// Child component wrapped with React.memo
const ChildComponent = React.memo(({ onClick }) => {
  console.log('Child component rendering');
  return <button onClick={onClick}>Increment</button>;
});
```

### useContext
Used to access React context, avoiding prop drilling.
```js
import React, { useContext, createContext, useState } from 'react';

// 1. Create Context
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    // 2. Provide Context value
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  // 3. Use Context
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#000' : '#fff'
      }}
    >
      Toggle Theme (Current: {theme})
    </button>
  );
}
```

### Custom Hooks
Used to extract common public scenarios, such as determining if it's client-side:
```js
import { useEffect, useState } from "react"

export const useIsClient = () => {
  const [isClient, setClient] = useState(false)

  useEffect(() => {
    setClient(true)
  }, [])

  return isClient
}
```

## Things to Note When Using
- Remember the rules of Hooks: Hooks must be called at the top level, cannot be called in conditional statements or loops. Violating this rule will cause hard-to-debug errors.
- Overusing useMemo and useCallback may make code complex and hard to maintain. Need to balance performance and readability.
- Other scenarios:

### State not updating after setting
For example, situations where initial values don't change due to closures:
```js
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // count here is always the initial value 0
      setCount(count + 1); 
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Empty dependency array

  return <div>{count}</div>;
}
```
Solution: Use functional updates.
```js
setCount(c => c + 1)
```
Also need to correctly declare corresponding dependencies in the dependency array.

### Precision issues with useEffect dependencies
When depending on an object or array, even if the values are the same, it will trigger updates. Or when object property values change, but updates aren't triggered.
This is because the reference address of the dependency hasn't changed:
```js
useEffect(() => {
  // Won't trigger when obj properties change, because obj reference hasn't changed
  console.log('obj changed');
}, [obj]); 

// Will trigger even if content is the same, because it's a new array
useEffect(() => {
  console.log('array changed');
}, [[1, 2, 3]]); 
```
Solution: For objects/arrays, use deep comparison or stable references (useMemo)

### Infinite loop problems
Occurs when modifying corresponding dependencies in useEffect or useMemo:
```js
// Case 1: Dependency changes trigger effect, effect modifies dependency
useEffect(() => {
  setCount(count + 1);
}, [count]);

// Case 2: Modifying dependencies in useMemo
const value = useMemo(() => {
  setSomething(newValue); // Anti-pattern
  return computeExpensiveValue();
}, [something]);
```

### Custom Hooks
- Need to determine naming conventions:
  - File names should also use use as prefix
  - Hook names must use corresponding nouns, verbs, states, etc. to reflect corresponding functionality.
- File organization:
  - Place in hooks for unified management or in corresponding functional modules
  - One Hook should only do one thing
  - Parameter design: Need to provide reasonable default values and extension options
- Return value conventions:
  - If there's only one operation method for the state value, use array format, similar to useState
  - If there are multiple operation methods for the state value, return an object.

## Summary
Hooks can keep components concise while enabling logic reuse within components. Compared to class components, they have better readability and maintainability.
