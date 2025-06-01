---
toc: content
group: 
  title: React基础
  order: 3
order: 6
---
# React里的Typescript应用
## 添加类型定义
TypeScript 默认支持JSX，
只需在项目中添加 @types/react 和 @types/react-dom 即可获得完整的 React Web 支持。

```sh
npm install @types/react @types/react-dom
```
配置tsconfig.json:

主要涉及jsx及lib，其中jsx用于控制如何处理.tsx文件中的JSX语法。lib用于设置JavaScript运行时环境或宿主环境。
- lib需要包含dom值，React应用需要有浏览器环境。
- jsx一般设置preserve即可，其作用是不进行转换，输出的文件扩展名仍为.jsx。其他的值还有：
  - react: 将JSX转换为React.createElement()，文件扩展名为.js
  - react-jsx: 将JSX转换为_jsx()调用（React 17+的新JSX运行时）
  - react-jsxdev: 使用开发版本的JSX运行时，会包含调试信息
  - none: 完全禁用JSX处理，遇到JSX会报错。

## React组件中使用
- 组件的文件名必须使用.tsx作为文件扩展名。
- 通常需要为组件的props定义类型。
  - 定义的方式可以是interface或type
```js
interface MyButtonProps {
  /** 按钮文字 */
  title: string;
  /** 按钮是否禁用 */
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
      <MyButton title="我是一个禁用按钮" disabled={true}/>
    </div>
  );
}
```
## 在Hooks中使用
通常@types/react已经定义了内置的Hook类型，因此可以在组件中直接使用。在使用时，我们只需要相应的泛型变量即可。
### useState
原生类型：
```js
const [enabled, setEnabled] = useState<boolean>(false);
```
自定义类型：
```js
type Status = "idle" | "loading" | "success" | "error";

const [status, setStatus] = useState<Status>("idle");
```
对象分组
```js
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', data: any }
  | { status: 'error', error: Error };

const [requestState, setRequestState] = useState<RequestState>({ status: 'idle' });
```

### useReducer
通常需要定义State和Action的类型，然后在Reducer函数中应用
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
      <h1>欢迎来到我的计数器</h1>

      <p>计数： {state.count}</p>
      <button onClick={addFive}>加 5</button>
      <button onClick={reset}>重置</button>
    </div>
  );
}
```
- interface State 描述了 reducer state 的类型。
- type CounterAction 描述了可以 dispatch 至 reducer 的不同 action。
- const initialState: State 为初始 state 提供类型，并且也将成为 useReducer 默认使用的类型。
- stateReducer(state: State, action: CounterAction): State 设置了 reducer 函数参数和返回值的类型。
除了在 initialState 上设置类型外，一个更明确的替代方法是为 useReducer 提供一个类型参数：

```js
import { stateReducer, State } from './your-reducer-implementation';

const initialState = { count: 0 };

export default function App() {
  const [state, dispatch] = useReducer<State>(stateReducer, initialState);
}
```
### useContext
在createContext时需要传入相应的类型。
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
      <p>当前主题：{theme}</p>
    </div>
  )
}
```

### useMemo
会从函数的返回值自动抢断类型。所以不需要额外指定类型。
```js
// 从 filterTodos 的返回值推断 visibleTodos 的类型
const visibleTodos = useMemo(() => filterTodos(todos, tab), [todos, tab]);
```

### useCallback
与 useMemo 类似，函数的类型是根据第一个参数中函数的返回值进行推断的，如果希望明确指定，可以为这个 Hook 提供一个类型参数以指定函数类型。
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
      <p>值： {value}</p>
    </>
  );
}
```

### useRef
与useState类似，在调用时传入类型
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
      <p>值： {value}</p>
    </>
  );
}
```
## 常用的内置类型
### 子元素
React.ReactNode类型用于表示React子元素，通常与children属性结合使用
```js
interface ModalRendererProps {
  title: string;
  children: React.ReactNode;
}
```
React.ReactNode即包含JSX元素，也包括JavaScript原始类型。
如果要限定只饮食JSX元素，使用 React.
```js
interface ModalRendererProps {
  title: string;
  children: React.ReactElement;
}
```

### DOM事件
在React中处理DOM事件时，事件的类型通常可以从事件处理程序中推断出来，但是，当你想提取一个函数以传递给事件处理程序时，你需要明确设置事件的类型。如：
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
      <p>值： {value}</p>
    </>
  );
}
```
其他常见的事件类型有：
- React.MouseEvent
- React.FormEvent
- React.KeyboardEvent

### 样式属性类型
React.CSSProperties 可以用来描述style属性的对象。用于确保传递的style包含有效的CSS属性。
```js
interface MyComponentProps {
  style: React.CSSProperties;
}
```

### React.Component
用于表示React的类组件类型

### React.FC
用于表示React的函数式组件

## 其他
### 泛型组件
组件需要支持动态类型时：
```js
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>;
}

// 使用
<List<{ id: number; name: string }>
  items={[{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]}
  renderItem={(item) => <span>{item.name}</span>}
/>
```

### 自定义Hooks的类型
自定义的Hooks也需要注意参数和返回值的类型，如果有类型变量，也可以支持泛型：
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

// 使用
const [name, setName] = useLocalStorage<string>('username', 'Alice');
```
### 第三方库的类型扩展
通常我们可以在@types/下找到第三方库的类型定义，如:
@types/lodash
如果未找到，也可以在.d.ts中，为相应的库添加类型：
```ts
declare module 'untyped-library' {
  export function doSomething(config: { foo: string }): void;
}
```

### 类型变换（类型处理工具）
基于某个定义的类型做处理：
```
- Partial<T>：所有属性变为可选。
- Required<T>：所有属性变为必选。
- Pick<T, K>：从 T 中选择部分属性 K。
- Omit<T, K>：从 T 中排除部分属性 K。
- ReturnType<T>：获取函数返回值类型。
```
如：
```js
type ButtonProps = {
  size: 'small' | 'medium' | 'large';
  variant: 'primary' | 'secondary';
};

type SmallButtonProps = Pick<ButtonProps, 'variant'> & {
  size?: 'small'; // 覆盖为固定值
};
```

### 错误边界的类型定义
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

### 高阶组件
高阶组件需要以泛型传入组件的Props
```ts
interface WithLoadingProps {
  isLoading: boolean;
}

function withLoading<P extends object>(Component: React.ComponentType<P>) {
  return function WithLoading(props: P & WithLoadingProps) {
    return props.isLoading ? <div>Loading...</div> : <Component {...props as P} />;
  };
}

// 使用
interface UserCardProps {
  name: string;
}

const UserCard: React.FC<UserCardProps> = ({ name }) => <div>{name}</div>;
const UserCardWithLoading = withLoading(UserCard);

<UserCardWithLoading name="Alice" isLoading={true} />
```

### API请求的类型
在实际项目中，通常会将类型单独抽离成文件，如types.ts，然后使用declare namespace 声明命名空间，将相关的请求和响应类型都封装在相应的模块下，如：
```md
src/
├── api/
│   ├── types.ts       # 集中定义所有API类型
│   ├── user.ts        # 用户相关API函数
│   └── product.ts     # 产品相关API函数
```
对于中大型项目，可以根据模块再进行拆分
```md
src/
├── modules/
│   ├── auth/
│   │   ├── api.ts     # API函数
│   │   └── types.ts   # 专属类型
│   └── product/
│       ├── api.ts
│       └── types.ts
```

类型使用命令空间包含：
```ts
// 基础响应结构
type ApiResponse<T> = {
  code: number;
  data: T;
  message?: string;
};

// 用户模块类型
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


## 全局类型管理
在复杂的项目中，需要对全局的类型进行管理，即对.d.ts文件进行拆分。通常有两种方式：
- 在types目录下集中管理。
- 在功能模块中声明。

### types目录
```md
src/
├── types/                # 集中管理全局类型
│   ├── global.d.ts       # 全局类型扩展（如 window 对象）
│   ├── modules.d.ts      # 第三方库类型补丁
│   ├── react.d.ts        # React 相关类型扩展
│   └── ...               # 其他业务类型
├── components/           # 组件目录
├── hooks/                # 自定义 Hook
└── ...
```

### 功能模块
```md
src/
├── features/
│   ├── auth/
│   │   ├── types.d.ts  # 认证模块专属类型
```
