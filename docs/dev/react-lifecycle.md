---
toc: content
group: 
  title: React基础
  order: 3
order: 3
---

# React生命周期
React 的生命周期主要分为三个阶段：MOUNTING、RECEIVE_PROPS、UNMOUNTING
## 挂载阶段
组件挂载时会：
- 初始化组件状态，
- 读取初始 state 和 props 
- 调用两个生命周期方法(componentWillMountt和componentDidMount)， 这两个方法只在这时调用。
  - 其中componentWillMount 会在 render 之前调用（在此调用 setState，是不会触发 re-render 的，而是会进行 state 的合并。因此此时的 this.state 不是最新的，在 render 中才可以获取更新后的 this.state。）
  - componentDidMount 会在 render 之后调用
## 更新阶段
组件更新是指父组件向下传递 props 或者组件自身执行 setState 方法时发生的一系列更新的动作
### 组件自身的 state 更新
会依次执行：
- shouldComponentUpdate（会接收需要更新的 props 和 state，让开发者增加必要的判断条件，在其需要的时候更新，不需要的时候不更新。如果返回的是 false，那么组件就不再向下执行生命周期方法。）
- componentWillUpdate
- render（能获取到最新的 this.state)
- componentDidUpdate（能获取到最新的 this.state)
### 父组件更新 props
会依次执行：
- componentWillReceiveProps（在此调用 setState，是不会触发 re-render 的，而是会进行 state 的合并。因此此时的 this.state 不是最新的，在 render 中才可以获取更新后的 this.state。
- shouldComponentUpdate
- componentWillUpdate
- render
- componentDidUpdate
## 组件卸载
会触发：
- componentWillMount（我们常常会在组件的卸载过程中执行一些清理方法，比如事件回收、清空定时器）

## 生命周期变化
### getDerivedStateFromProps
componentWillReceiveProps 已经被 getDerivedStateFromProps 替代
| 特性         | componentWillReceiveProps (旧) | getDerivedStateFromProps (新)            |
|--------------|--------------------------------|------------------------------------------|
| 生命周期阶段 | 即将接收新 props 前调用        | 在渲染前调用                             |
| 调用频率     | 父组件每次重新渲染都会触发     | 父组件重新渲染或本组件 setState 都会触发 |
| 安全性       | 可能被多次调用，易产生副作用   | 静态方法，无法访问实例，更安全           |
| 返回值       | 无返回值，需手动调用 setState  | 返回对象用于更新 state，或 null 不更新   |
| 访问实例     | 可访问 this (组件实例)         | 无法访问 this (静态方法)                 |
| 推荐用途     | 旧版用于响应 props 变化        | 专为派生 state 设计                      |

### 错误边界生命周期
有getDerivedStateFromError 和componentDidCatch方法，在子组件发生错误时捕获。主要用与设置错误状态的界面展示。
```js
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染显示降级 UI
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
componentDidCatch在子组件抛出错误后，提交阶段调用，主要用于提交错误日志。
```js
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  componentDidCatch(error, info) {
    // 可以在此处记录错误到监控系统
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

### 函数式组件的生命周期
主要基于useEffect实现
- 当没有任何依赖时，相当于挂载阶段的componentDidMount。
- 当有依赖时，相当于更新阶段。
- 当useEffect有返回函数时，相当于卸载阶段。
以下是完整的映射：

| Class 组件生命周期       | 函数式组件实现方式                            |
|--------------------------|-----------------------------------------------|
| constructor              | useState 初始化                               |
| render                   | 函数组件返回值                                |
| componentDidMount        | useEffect 空依赖                              |
| componentDidUpdate       | useEffect 指定依赖                            |
| componentWillUnmount     | useEffect 清理函数                            |
| shouldComponentUpdate    | React.memo 或 useMemo                         |
| getDerivedStateFromProps | useState + useEffect                          |
| getSnapshotBeforeUpdate  | 目前无直接等价，可用 useLayoutEffect 部分替代 |
| componentDidCatch        | 仍需使用 class 组件                           |


Demo代码：
```js
import React, { 
  useState, 
  useEffect, 
  useLayoutEffect,
  useRef,
  memo 
} from 'react';

// 使用React.memo实现shouldComponentUpdate
const MyComponent = memo(function MyComponent(props) {
  const { initialCount, user } = props;
  
  // === 相当于constructor ===
  const [count, setCount] = useState(initialCount);
  const [prevUser, setPrevUser] = useState(user);
  const [derivedData, setDerivedData] = useState(null);
  const mountRef = useRef(false);
  
  // === 相当于getDerivedStateFromProps ===
  if (user !== prevUser) {
    setDerivedData(`${user.name}'s data`);
    setPrevUser(user);
  }
  
  // === 相当于componentDidMount + componentDidUpdate ===
  useEffect(() => {
    if (!mountRef.current) {
      // 只在挂载时执行一次 (componentDidMount)
      console.log('组件挂载完成');
      mountRef.current = true;
      
      // 可以在这里执行初始化操作
      fetchData();
    } else {
      // 更新时执行 (componentDidUpdate)
      console.log('组件更新，当前count:', count);
    }
    
    // 返回的函数相当于componentWillUnmount
    return () => {
      console.log('组件即将卸载或依赖项变化前的清理');
    };
  }, [count]); // 依赖项数组，只有count变化时才执行effect
  
  // === 相当于getSnapshotBeforeUpdate的部分功能 ===
  useLayoutEffect(() => {
    const element = document.getElementById('counter');
    if (element) {
      console.log('DOM更新前的布局信息:', element.getBoundingClientRect());
    }
    
    return () => {
      // 可以在这里获取更新前的DOM状态
    };
  });
  
  // 模拟数据获取
  const fetchData = async () => {
    try {
      console.log('开始获取数据...');
      // const response = await fetch('api/data');
      // const data = await response.json();
      // setDerivedData(data);
      setTimeout(() => {
        setDerivedData('加载的数据');
      }, 1000);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  };
  
  // 事件处理函数
  const handleClick = () => {
    setCount(c => c + 1);
  };
  
  // === render ===
  console.log('渲染执行'); // 每次渲染都会执行
  
  return (
    <div>
      <h2>函数式组件生命周期示例</h2>
      <div id="counter">
        <p>计数: {count}</p>
        <button onClick={handleClick}>增加</button>
      </div>
      <p>用户: {user.name}</p>
      <p>派生数据: {derivedData || '加载中...'}</p>
    </div>
  );
});

// 使用示例
function App() {
  const [user, setUser] = useState({ name: '张三' });
  
  return (
    <div>
      <MyComponent initialCount={0} user={user} />
      <button onClick={() => setUser({ name: '李四' })}>更改用户</button>
    </div>
  );
}

export default App;
```
其中：
**挂载阶段：**
- useState 初始化相当于 constructor
- useEffect 空依赖数组 ([]) 相当于 componentDidMount

**更新阶段：**
- 通过 useEffect 的依赖项数组实现 componentDidUpdate
- 使用 useState + 条件判断实现 getDerivedStateFromProps
- useLayoutEffect 可以在 DOM 更新前同步执行代码

**卸载阶段：**
- useEffect 返回的清理函数相当于 componentWillUnmount

**性能优化：**
- React.memo 包裹组件实现 shouldComponentUpdate
- useMemo 和 useCallback 可以避免不必要的计算和渲染
