---
toc: content
group: 
  title: React Basics
  order: 3
order: 6
---
# TypeScript Application in React

## Adding Type Definitions
TypeScript supports JSX by default. You only need to add @types/react and @types/react-dom to your project to get complete React Web support.

```sh
npm install @types/react @types/react-dom
```

Configure tsconfig.json:

Mainly involves jsx and lib, where jsx controls how to handle JSX syntax in .tsx files. lib is used to set the JavaScript runtime environment or host environment.
- lib needs to include dom value, React applications need browser environment.
- jsx generally set to preserve, which means no conversion, output file extension remains .jsx. Other values include:
  - react: Convert JSX to React.createElement(), file extension is .js
  - react-jsx: Convert JSX to _jsx() calls (React 17+ new JSX runtime)
  - react-jsxdev: Use development version of JSX runtime, includes debug information
  - none: Completely disable JSX processing, will error when encountering JSX.

## Usage in React Components
- Component file names must use .tsx as file extension.
- Usually need to define types for component props.
  - Can be defined using interface or type
```js
interface MyButtonProps {
  /** Button text */
  title: string;
  /** Whether button is disabled */
  disabled: boolean;
}

function MyButton({ title, disabled }: MyButtonProps) {
  return (
    <button disabled={disabled}>{title}</button>
  );
}

export default function MyApp() {
  return (
    <div>
      <h1>Welcome to my app</h1>
      <MyButton title="I am a disabled button" disabled={true}/>
    </div>
  );
}
```

## Usage in Hooks
Usually @types/react has already defined built-in Hook types, so they can be used directly in components. When using, we only need corresponding generic variables.

### useState
Native types:
```js
const [enabled, setEnabled] = useState<boolean>(false);
```

Custom types:
```js
type Status = "idle" | "loading" | "success" | "error";

const [status, setStatus] = useState<Status>("idle");
```

Object grouping:
```js
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', data: any }
  | { status: 'error', error: Error };

const [requestState, setRequestState] = useState<RequestState>({ status: 'idle' });
```

### useReducer
Usually need to define State and Action types, then apply in Reducer function:
```js
import {useReducer} from 'react';

interface State {
   count: number 
};

type CounterAction =
  | { type: "reset" }
  | { type: "setCount"; value: State["count"] }

const initialState: State = { count: 0 };

function stateReducer(state: State, action: CounterAction): State {
  switch (action.type) {
    case "reset":
      return initialState;
    case "setCount":
      return { ...state, count: action.value };
    default:
      throw new Error("Unknown action");
  }
}

export default function App() {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  const addFive = () => dispatch({ type: "setCount", value: state.count + 5 });
  const reset = () => dispatch({ type: "reset" });

  return (
    <div>
      <h1>Welcome to my counter</h1>

      <p>Count: {state.count}</p>
      <button onClick={addFive}>Add 5</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```
- interface State describes the type of reducer state.
- type CounterAction describes different actions that can be dispatched to the reducer.
- const initialState: State provides type for initial state and will also be the default type used by useReducer.
- stateReducer(state: State, action: CounterAction): State sets the parameter and return value types of the reducer function.

Besides setting types on initialState, a more explicit alternative is to provide a type parameter for useReducer:

```js
import { stateReducer, State } from './your-reducer-implementation';

const initialState = { count: 0 };

export default function App() {
  const [state, dispatch] = useReducer<State>(stateReducer, initialState);
}
```

### useContext
Need to pass corresponding types when creating context:
```js
import { createContext, useContext, useState } from 'react';

type Theme = "light" | "dark" | "system";
const ThemeContext = createContext<Theme>("system");

const useGetTheme = () => useContext(ThemeContext);

export default function MyApp() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeContext.Provider value={theme}>
      <MyComponent />
    </ThemeContext.Provider>
  )
}

function MyComponent() {
  const theme = useGetTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
    </div>
  )
}
```

### useMemo
Will automatically infer types from function return values. So no need to specify types additionally.
```js
// Infer visibleTodos type from filterTodos return value
const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
```

### useCallback
Similar to useMemo, function type is inferred from the return value of the function in the first parameter. If you want to specify explicitly, you can provide a type parameter for this Hook to specify the function type.
```js
import { useState, useCallback } from 'react';

export default function Form() {
  const [value, setValue] = useState("Change me");

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
    setValue(event.currentTarget.value);
  }, [setValue])
  
  return (
    <>
      <input value={value} onChange={handleChange} />
      <p>Value: {value}</p>
    </>
  );
}
```

### useRef
Similar to useState, pass type when calling:
```js
import { useRef } from 'react';

export default function Form() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={inputRef} />
    </>
  );
}
```

## Common Built-in Types
### Children
React.ReactNode type is used to represent React children, usually combined with children property:
```js
interface ModalRendererProps {
  title: string;
  children: React.ReactNode;
}
```
React.ReactNode includes JSX elements and JavaScript primitive types.
If you want to limit to only JSX elements, use React.ReactElement:
```js
interface ModalRendererProps {
  title: string;
  children: React.ReactElement;
}
```

### DOM Events
When handling DOM events in React, event types can usually be inferred from event handlers, but when you want to extract a function to pass to event handlers, you need to explicitly set the event type:
```js
import { useState } from 'react';

export default function Form() {
  const [value, setValue] = useState("Change me");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.currentTarget.value);
  }

  return (
    <>
      <input value={value} onChange={handleChange} />
      <p>Value: {value}</p>
    </>
  );
}
```

Other common event types include:
- React.MouseEvent
- React.FormEvent
- React.KeyboardEvent

### Style Property Types
React.CSSProperties can be used to describe objects for style properties. Used to ensure passed styles contain valid CSS properties.
```js
interface MyComponentProps {
  style: React.CSSProperties;
}
```

### React.Component
Used to represent React class component types

### React.FC
Used to represent React functional components

## Others
### Generic Components
When components need to support dynamic types:
```js
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>;
}

// Usage
<List<{ id: number; name: string }>
  items={[{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]}
  renderItem={(item) => <span>{item.name}</span>}
/>
```

### Custom Hooks Types
Custom Hooks also need to pay attention to parameter and return value types. If there are type variables, they can also support generics:
```js
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}

// Usage
const [name, setName] = useLocalStorage<string>('username', 'Alice');
```

### Third-party Library Type Extensions
Usually we can find type definitions for third-party libraries under @types/, such as:
@types/lodash
If not found, we can also add types for corresponding libraries in .d.ts:
```ts
declare module 'untyped-library' {
  export function doSomething(config: { foo: string }): void;
}
```

### Type Transformations (Type Utility Tools)
Process based on a defined type:
```
- Partial<T>: All properties become optional.
- Required<T>: All properties become required.
- Pick<T, K>: Select partial properties K from T.
- Omit<T, K>: Exclude partial properties K from T.
- ReturnType<T>: Get function return value type.
```

For example:
```js
type ButtonProps = {
  size: 'small' | 'medium' | 'large';
  variant: 'primary' | 'secondary';
};

type SmallButtonProps = Pick<ButtonProps, 'variant'> & {
  size?: 'small'; // Override to fixed value
};
```

### Error Boundary Type Definitions
```ts
interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
```

### Higher-Order Components
Higher-order components need to pass component Props as generics:
```ts
interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<P extends object>(Component: React.ComponentType<P>) {
  return function WithLoading(props: P & WithLoadingProps) {
    return props.isLoading ? <div>Loading...</div> : <Component {...props as P} />;
  };
}

// Usage
interface UserCardProps {
  name: string;
}

const UserCard: React.FC<UserCardProps> = ({ name }) => <div>{name}</div>;
const UserCardWithLoading = withLoading(UserCard);

<UserCardWithLoading name="Alice" isLoading={true} />
```

### API Request Types
In actual projects, types are usually extracted into separate files, such as types.ts, then use declare namespace to declare namespaces, encapsulating related request and response types under corresponding modules:
```md
src/
├── api/
│   ├── types.ts       # Centralized definition of all API types
│   ├── user.ts        # User-related API functions
│   └── product.ts     # Product-related API functions
```

For medium and large projects, can be further split by modules:
```md
src/
├── modules/
│   ├── auth/
│   │   ├── api.ts     # API functions
│   │   └── types.ts   # Exclusive types
│   └── product/
│       ├── api.ts
│       └── types.ts
```

Type usage includes namespaces:
```ts
// Basic response structure
type ApiResponse<T> = {
  code: number;
  data: T;
  message?: string;
};

// User module types
declare namespace User {
  type Profile = {
    id: string;
    name: string;
  };

  type LoginParams = {
    username: string;
    password: string;
  };
}
```

## Global Type Management
In complex projects, global types need to be managed, that is, split .d.ts files. Usually there are two ways:
- Centralized management in types directory.
- Declare in functional modules.

### types Directory
```md
src/
├── types/                # Centralized management of global types
│   ├── global.d.ts       # Global type extensions (such as window object)
│   ├── modules.d.ts      # Third-party library type patches
│   ├── react.d.ts        # React-related type extensions
│   └── ...               # Other business types
├── components/           # Component directory
├── hooks/                # Custom Hook
└── ...
```

### Functional Modules
```md
src/
├── features/
│   ├── auth/
│   │   ├── types.d.ts  # Authentication module exclusive types
```
