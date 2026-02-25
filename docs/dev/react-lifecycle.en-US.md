---
toc: content
group: 
  title: React Basics
  order: 3
order: 3
---

# React Lifecycle

React's lifecycle is mainly divided into three stages: MOUNTING, RECEIVE_PROPS, UNMOUNTING

## Mounting Stage
When components mount:
- Initialize component state
- Read initial state and props
- Call two lifecycle methods (componentWillMount and componentDidMount), these two methods are only called at this time.
  - componentWillMount is called before render (calling setState here won't trigger re-render, but will merge state. Therefore this.state is not the latest, only in render can you get the updated this.state.)
  - componentDidMount is called after render

## Update Stage
Component updates refer to a series of update actions that occur when parent components pass props down or components themselves execute setState methods.

### Component's own state update
Will execute in order:
- shouldComponentUpdate (receives props and state that need updating, allows developers to add necessary judgment conditions, updating when needed, not updating when not needed. If false is returned, the component won't continue executing lifecycle methods.)
- componentWillUpdate
- render (can get the latest this.state)
- componentDidUpdate (can get the latest this.state)

### Parent component updating props
Will execute in order:
- componentWillReceiveProps (calling setState here won't trigger re-render, but will merge state. Therefore this.state is not the latest, only in render can you get the updated this.state.)
- shouldComponentUpdate
- componentWillUpdate
- render
- componentDidUpdate

## Component Unmounting
Will trigger:
- componentWillUnmount (we often execute some cleanup methods in the component unmounting process, such as event cleanup, clearing timers)

## Lifecycle Changes
### getDerivedStateFromProps
componentWillReceiveProps has been replaced by getDerivedStateFromProps

| Feature         | componentWillReceiveProps (Old) | getDerivedStateFromProps (New)            |
|-----------------|--------------------------------|------------------------------------------|
| Lifecycle Stage | Called before receiving new props | Called before rendering                  |
| Call Frequency  | Triggered every time parent component re-renders | Triggered when parent component re-renders or this component setState |
| Safety          | May be called multiple times, prone to side effects | Static method, cannot access instance, safer |
| Return Value    | No return value, need to manually call setState | Returns object to update state, or null for no update |
| Access Instance | Can access this (component instance) | Cannot access this (static method) |
| Recommended Use | Old version for responding to props changes | Designed specifically for derived state |

### Error Boundary Lifecycle
There are getDerivedStateFromError and componentDidCatch methods that catch when child components have errors. Mainly used for setting error state interface display.
```js
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    // Update state to show fallback UI on next render
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children; 
  }
}
```

componentDidCatch is called in the commit phase after child components throw errors, mainly used for submitting error logs.
```js
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  componentDidCatch(error, info) {
    // Can log errors to monitoring system here
    logErrorToService(error, info.componentStack);
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### Functional Component Lifecycle
Mainly implemented based on useEffect
- When there are no dependencies, equivalent to componentDidMount in mounting stage.
- When there are dependencies, equivalent to update stage.
- When useEffect has a return function, equivalent to unmounting stage.

Here's the complete mapping:

| Class Component Lifecycle       | Functional Component Implementation                    |
|--------------------------------|-------------------------------------------------------|
| constructor                    | useState initialization                               |
| render                         | Function component return value                       |
| componentDidMount              | useEffect with empty dependencies                     |
| componentDidUpdate             | useEffect with specified dependencies                 |
| componentWillUnmount           | useEffect cleanup function                            |
| shouldComponentUpdate          | React.memo or useMemo                                 |
| getDerivedStateFromProps       | useState + useEffect                                  |
| getSnapshotBeforeUpdate        | No direct equivalent, can partially replace with useLayoutEffect |
| componentDidCatch              | Still need to use class components                    |

Demo code:
```js
import React, { 
  useState, 
  useEffect, 
  useLayoutEffect,
  useRef,
  memo 
} from 'react';

// Use React.memo to implement shouldComponentUpdate
const MyComponent = memo(function MyComponent(props) {
  const { initialCount, user } = props;
  
  // === Equivalent to constructor ===
  const [count, setCount] = useState(initialCount);
  const [prevUser, setPrevUser] = useState(user);
  const [derivedData, setDerivedData] = useState(null);
  const mountRef = useRef(false);
  
  // === Equivalent to getDerivedStateFromProps ===
  if (user !== prevUser) {
    setDerivedData(`${user.name}'s data`);
    setPrevUser(user);
  }
  
  // === Equivalent to componentDidMount + componentDidUpdate ===
  useEffect(() => {
    if (!mountRef.current) {
      // Only execute once on mount (componentDidMount)
      console.log('Component mounted');
      mountRef.current = true;
      
      // Can execute initialization operations here
      fetchData();
    } else {
      // Execute on update (componentDidUpdate)
      console.log('Component updated, current count:', count);
    }
    
    // Return function equivalent to componentWillUnmount
    return () => {
      console.log('Component about to unmount or cleanup before dependency changes');
    };
  }, [count]); // Dependency array, only execute effect when count changes
  
  // === Partial functionality equivalent to getSnapshotBeforeUpdate ===
  useLayoutEffect(() => {
    const element = document.getElementById('counter');
    if (element) {
      console.log('Layout info before DOM update:', element.getBoundingClientRect());
    }
    
    return () => {
      // Can get DOM state before update here
    };
  });
  
  // Simulate data fetching
  const fetchData = async () => {
    try {
      console.log('Starting to fetch data...');
      // const response = await fetch('api/data');
      // const data = await response.json();
      // setDerivedData(data);
      setTimeout(() => {
        setDerivedData('Loaded data');
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };
  
  // Event handler function
  const handleClick = () => {
    setCount(c => c + 1);
  };
  
  // === render ===
  console.log('Render execution'); // Executes on every render
  
  return (
    <div>
      <h2>Functional Component Lifecycle Example</h2>
      <div id="counter">
        <p>Count: {count}</p>
        <button onClick={handleClick}>Increment</button>
      </div>
      <p>User: {user.name}</p>
      <p>Derived data: {derivedData || 'Loading...'}</p>
    </div>
  );
});

// Usage example
function App() {
  const [user, setUser] = useState({ name: 'Zhang San' });
  
  return (
    <div>
      <MyComponent initialCount={0} user={user} />
      <button onClick={() => setUser({ name: 'Li Si' })}>Change User</button>
    </div>
  );
}

export default App;
```

Among these:
**Mounting Stage:**
- useState initialization equivalent to constructor
- useEffect with empty dependency array ([]) equivalent to componentDidMount

**Update Stage:**
- Implement componentDidUpdate through useEffect dependency array
- Use useState + conditional judgment to implement getDerivedStateFromProps
- useLayoutEffect can synchronously execute code before DOM updates

**Unmounting Stage:**
- useEffect return cleanup function equivalent to componentWillUnmount

**Performance Optimization:**
- Wrap components with React.memo to implement shouldComponentUpdate
- useMemo and useCallback can avoid unnecessary calculations and renders
