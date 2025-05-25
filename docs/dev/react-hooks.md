---
toc: content
group: 
  title: React基础
  order: 3
order: 5
---
# React Hooks使用总结
## 是什么
React Hooks 是一种在函数组件中使用状态和其他React特性的方式，可代替传统的类组件。且相对类组件，它们能够更方便地复用组件逻辑，并且代码更易读、易于维护。

## 常用的Hooks
### useState
用于在函数组件中添加状态。它允许你在不使用类的情况下拥有可变的状态。
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
用于处理副作用（如数据获取、订阅或手动修改DOM）。它可以替代componentDidMount、componentDidUpdate和componentWillUnmount等生命周期方法。
```js
// 代替componentDidMount
useEffect(() => {
  // 执行副作用操作
}, []);

// componentDidUpdate
useEffect(() => {
  // 执行副作用操作
}, [依赖项]);

// componentWillUnmount
// 清除定时器
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Timer running...');
  }, 1000);

  return () => {
    clearInterval(timer); // 组件卸载时清除定时器
  };
}, []);

// 取消网络请求
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
    controller.abort(); // 组件卸载时取消请求
  };
}, []);

// 移除事件监听
useEffect(() => {
  const handleScroll = () => {
    console.log('Window scrolled');
  };

  window.addEventListener('scroll', handleScroll);

  return () => {
    window.removeEventListener('scroll', handleScroll); // 卸载时移除监听
  };
}, []);

// 清理websocket订阅
useEffect(() => {
  const socket = new WebSocket('wss://example.com/socket');

  socket.onmessage = (event) => {
    console.log('Message received:', event.data);
  };

  return () => {
    socket.close(); // 组件卸载时关闭 WebSocket
  };
}, []);
```

### useReducer
用于复杂的状态逻辑管理，类似于Redux中的reducer函数。它适用于状态逻辑较为复杂的情况。
```js
import React, { useReducer } from 'react';

// 1. 定义 reducer 函数
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
  // 2. 使用 useReducer
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
主要用与访问DOM元素或存储可变值（不会触发重新渲染）
```js
// DOM操作
import React, { useRef } from 'react';

function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  
  const onButtonClick = () => {
    // `current` 指向已挂载的 input 元素
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

存储可变值
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
用于记忆计算结果，当依赖项未变化时返回缓存的结果。
```js
import React, { useMemo } from 'react';

function ExpensiveCalculationComponent({ list }) {
  // 只有list变化时才会重新计算
  const sortedList = useMemo(() => {
    console.log('重新排序...');
    return [...list].sort((a, b) => a.value - b.value);
  }, [list]); // 依赖项

  return (
    <ul>
      {sortedList.map(item => (
        <li key={item.id}>{item.value}</li>
      ))}
    </ul>
  );
}
```
适用情况：
- 大型列表的排序/过滤操作
- 复杂的数学计算
- 格式化/转换大量数据
- 避免不必要的子组件重新渲染（与React.memo配合）

### useCallback
用于记忆回调函数，避免因函数重新创建导致的子组件重新渲染。
```js
import React, { useState, useCallback } from 'react';

function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // 使用useCallback缓存函数
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 空依赖表示函数永远不会改变

  return (
    <div>
      <p>Count: {count}</p>
      <ChildComponent onClick={handleClick} />
    </div>
  );
}

// 用React.memo包裹的子组件
const ChildComponent = React.memo(({ onClick }) => {
  console.log('子组件渲染');
  return <button onClick={onClick}>增加</button>;
});
```

### useContext
用于访问React上下文（Context），可以避免将props逐层传递。
```js
import React, { useContext, createContext, useState } from 'react';

// 1. 创建Context
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    // 2. 提供Context值
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
  // 3. 使用Context
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <button 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      style={{
        background: theme === 'light' ? '#fff' : '#333',
        color: theme === 'light' ? '#000' : '#fff'
      }}
    >
      切换主题 (当前: {theme})
    </button>
  );
}
```

### 自定义Hooks
用于抽离常见的公共场景，如，判断是否是客户端
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

## 使用中需要注意的
- 需要记住Hooks的规则：必须在最顶层调用Hooks，不能在条件语句或循环中调用。违反这一规则会导致难以调试的错误。
- 过度使用useMemo和useCallback可能导致代码变得复杂且难以维护。需要权衡性能和可读性。
- 其他场景：

### 状态设置后不更新
比如因为闭包引起的初始值不变的情况，
```js
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // 这里的count永远是初始值0
      setCount(count + 1); 
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 空依赖数组

  return <div>{count}</div>;
}
```
解决方案：使用函数式更新。
```js
setCount(c => c + 1)
```
还需要在依赖数组中正确声明相应的依赖项。

### useEffect依赖的精确性问题
当依赖的是某个对象或数组时，就算值一样，也会触发更新。或者对象的属性值变化，但是也没触发更新。
这是因为依赖的引用地址没变：
```js
useEffect(() => {
  // 当obj属性变化时不会触发，因为obj引用没变
  console.log('obj changed');
}, [obj]); 

// 即使内容相同也会触发，因为是新数组
useEffect(() => {
  console.log('array changed');
}, [[1, 2, 3]]); 
```
解决：对于对象/数组，使用深比较或稳定化引用（useMemo）

### 无限循环问题
当在useEffect或useMemo中修改相应的依赖项时会发生：
```js
// 情况1：依赖项变化触发effect，effect又修改依赖项
useEffect(() => {
  setCount(count + 1);
}, [count]);

// 情况2：在useMemo中修改依赖项
const value = useMemo(() => {
  setSomething(newValue); // 反模式
  return computeExpensiveValue();
}, [something]);
```

### 自定义Hooks
- 需要确定好命名规范，
  - 文件名称也需要使用use作为前缀
  - Hooks的名称必须使用相应的名词、动词、状态等体现出相应的功能。
- 文件组织
  - 放在hooks里统一管理或放在相应的功能模块中管理
  - 一个Hook应该只做一件事
  - 参数设计：需要提供合理的默认值和扩展选项
- 返回值规范
  - 如果状态值只有一个操作方法，使用数组的格式，类似useState
  - 如果状态值有多个操作方法，返回对象。

## 总结
Hooks可以让组件保持简洁，同时又能实现组件内部的逻辑复用。相对于类组件，有更好的可读性和可维护性。