---
toc: content
group: 
  title: 项目经验
  order: 1
order: 4
---
# 微前端应用
## 背景
传统的SPA应用，在经过一定时间的迭代后，会逐步变成巨石应用，从而引出下列问题：
- 团队协作困难：在项目变大后，经常会根据模块等分团队负责开发，这时如果还共用代码库，会导致代码冲突、依赖管理复杂、团队交流成本高等问题产生。
- 技术栈僵化：核心架构等使用的技术栈难以升级，新的更好的技术方案难以整合，为保证稳定，只能依赖早期的技术栈进行迭代。
- 部署耦合：任何微小的改动都需要全量发布，风险高，效率低。
- 性能瓶颈：随着组件数量增加，就算运用了如代码拆分，懒加载等手段，打包后的代码体积还是会过大，首屏的加载速度变慢。

## 什么是微前端
微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

微前端架构具备以下几个核心价值：
- **技术栈无关**：主框架不限制接入应用的技术栈，微应用具备完全自主权
- **独立开发、独立部署**：微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新
- **增量升级**：在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略
- **独立运行时**：每个微应用之间状态隔离，运行时状态不共享

## 解决方案
主要的解决方案就是拆分项目，根据业务模块的关联性，使用的频率等，将项目拆分为多个，在做好隔离和通信的情况下，再组合成一个整体。以下是常见的拆分方案

### 多页应用（MPA）
通过链接跳转到不同的独立页面，该页面下是一个独的项目。这个方案:
- 优点：实现简单
- 缺点：
  - 用户体验割裂，切换到不同页面后，需要重新初始化整个框架。
  - 应用之间的状态无法共享，需要通过参数等重新初始化。
  - 重复加载资源：不同页面之间的资源，就算相同，也需要重新加载。

### iframe方案
在确定一个主应用框架后，通过iframe及路由来隔离相应的子应用。
- 优点：实现简单，iframe就是天然的沙箱，可以完全隔离css和js，避免冲突。
- 缺点：
  - 通信困难，一般使用postMessage来实现，维护和调试也比较麻烦。
  - 性能较差：iframe本身就比较耗资源，中后台有多标签页面功能时，可能会造成多个iframe共存，系统卡顿。
  - 重复加载资源：每个iframe都对应一个子应用，一样也需要加载所有的框架资源。

### 微前端方案
主要有3种实现方案：
- 基于路由的微前端框架，代表是Qiankun，它在Single-SPA的基础上，增加了沙箱隔离、资源预加载等功能。
- 基于模块联邦（Module Federation）：Webpack 5支持模块共享，允许跨应用动态加载代码。可以通过抽离模块和逻辑来减少应用的体积。
- Web Components方案：利用浏览器的Shadow DOM来实现隔离。当前生态还较弱。代表框架是腾讯的Wujie。

## 技术选型
公司使用的Qiankun，主要是因为：
- 企业级应用的产品，需要做到性能最优，所以不考虑多页应用及iframe方案。
- Web Components现在生态还比较弱，且对浏览器有要求，当前公司的客户，有些浏览器版本还比较旧。
- Webpack 5 Module Federation（MF）依赖Webpack 5，但是旧项目的webpack等无法升级，且我们新的项目也考虑引入vite及Turbopack等构建工具，所以也不考虑。
- 阿里的Qiankun和京东的MicroApp都可以满足项目需求。选择Qiankun主要是考虑：
  - 公司有钉钉等插件开发的情况。
  - 当时Qiankun的生态更大。
  - 运用也更广泛，遇到问题时，解决起来有更多的参考。

如果是现在选择的话，可以考虑京东的MicroApp，没有基于Single-App，完全自研，所以在隔离性和性能上都比Qiankun优秀。另外Qiankun这些年好像也没什么更新了，虽然有阿里背书，这个项目明显也在走下坡路。

## qiankun开发
### 动态注册应用
#### 代码实现
通常一个系统的子应用是动态变化的，为了避免每次变更时发布主应用，可以通过接口动态注册子应用：
```js
// src/micro/apps-register.js
import { registerMicroApps, start } from 'qiankun';

let isQiankunStarted = false;

export async function registerDynamicApps() {
  // 1. 从接口获取子应用配置
  const appConfigs = await fetchAppConfigs();
  
  // 2. 动态注册子应用
  registerMicroApps(appConfigs, {
    beforeLoad: app => console.log('before load', app.name),
    beforeMount: app => console.log('before mount', app.name),
    afterUnmount: app => console.log('after unmount', app.name),
  });

  // 3. 启动qiankun（仅第一次调用生效）
  if (!isQiankunStarted) {
    start({ prefetch: 'all' });
    isQiankunStarted = true;
  }
}

async function fetchAppConfigs() {
  const response = await fetch('/api/sub-apps');
  const data = await response.json();
  
  return data.map(app => ({
    name: app.appName,
    entry: app.entryUrl,
    container: '#subapp-container',
    activeRule: app.activeRule,
    props: { ...app.props } // 传递自定义props
  }));
}
```
这里需要保证只启动一次。

通常在App.jsx里调用动态注册函数
```js
// src/App.jsx
import { useEffect } from 'react';
import { registerDynamicApps } from './micro/apps-register';

function App() {
  useEffect(() => {
    // 方案1：应用初始化时注册
    registerDynamicApps();
    
    // 或方案2：用户登录后注册
    // authStore.onLogin(() => registerDynamicApps());
  }, []);

  return (
    <div>
      <div id="subapp-container"></div>
    </div>
  );
}
```
如果子应用依赖当前登录用户，可以使用方案2，在用户登录完成后，再进行注册。

#### 性能优化
子应用的变化并不频繁的，所以如果每次初始化都请求子应用列表接口会造成不必要的浪费。可以考虑的优化方案有：
- 内置已知的子应用，先正常注册并启动项目，然后再请求配置接口，动态追加新的子应用。
- 配置内嵌：在index.html中，动态添加window.__MICRO_APPS_INITIAL__之类的全局变量。在每次应用更新时，自动同步更新该文件
```js
<!-- 主应用HTML模板中内嵌初始配置 -->
<script id="micro-apps-config" type="application/json">
  {
    "version": "20240620",
    "apps": [
      { "name": "main-subapp", "entry": "/static/subapp/main" }
    ]
  }
</script>

<script>
  window.__MICRO_APPS_INITIAL__ = 
    JSON.parse(document.getElementById('micro-apps-config').textContent);
</script>
```
### 子应用初始化
使用qiankun，子应用最好是基于webpack，主要的开发工作有：
- public-path.js创建
```js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```
- 设置history模式路由的base，该值与应用注册时的activeRule一致
```js
<BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/app-react' : '/'}>
```
- 入口index.js修改渲染方法，增加环境判断及生命周期函数
```js
import './public-path';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function render(props) {
  const { container } = props;
  ReactDOM.render(<App />, container ? container.querySelector('#root') : document.querySelector('#root'));
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[react16] react app bootstraped');
}

export async function mount(props) {
  console.log('[react16] props from main framework', props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}
```
- 配置子应用跨域，并设置打包目标为umd模式，及设置库的名称。
```js
const { name } = require('./package');

module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = 'umd';
    // webpack 5 需要把 jsonpFunction 替换成 chunkLoadingGlobal
    config.output.jsonpFunction = `webpackJsonp_${name}`; 
    config.output.globalObject = 'window';

    return config;
  },

  devServer: (_) => {
    const config = _;

    config.headers = {
      'Access-Control-Allow-Origin': '*',
    };
    config.historyApiFallback = true;
    config.hot = false;
    config.watchContentBase = false;
    config.liveReload = false;

    return config;
  },
};
```

### 状态共享与通信
#### initGlobalState方案
initGlobalState是qiankun提供的api，该方法返回MicroAppStateActions，可以设置对状态的监听和设置
在子应用中，会通过props，将onGlobalStateChange、setGlobalState方法传递过去。
```js
// 主应用 src/global-state.js
import { initGlobalState } from 'qiankun';

const initialState = { 
  user: { name: 'Admin', role: 'admin' },
  token: 'xxxx'
};

const actions = initGlobalState(initialState);

// 主应用监听变化
actions.onGlobalStateChange((state, prevState) => {
  console.log('主应用收到状态变更:', state);
});

// 暴露给子应用
export default actions;

// --------------------------------------------------
// 子应用（React示例）接入
export function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    // 响应状态变化
    console.log('子应用收到:', state);
  });
  
  // 修改全局状态
  props.setGlobalState({ token: 'new-token' });
}
```
上面只是最简单的例子，实际开发中，状态对象可能是一个拥有深层级的大对象，在设置更新时，需要使用...解构整个对象才能触发更新。
```js
// ✅ 正确做法 - 展开所有父层级
actions.setGlobalState({
  ...currentState, // 保留其他状态
  user: {
    ...currentState.user, // 保留user其他属性
    profile: {
      ...currentState.user.profile,
      name: 'New Name' // 只修改目标属性
    }
  }
});

// 或使用lodash的_.merge
import { merge } from 'lodash';
actions.setGlobalState(merge({}, currentState, {
  user: { profile: { name: 'New Name' } }
}));
```
子应用更新状态，通常也不会在mount时更新，而是在页面上的某个操作时触发。需要能够在组件里获取到相应的action操作，常用的方案有：
- 将props做成全局的变量。
```js
// 子应用入口文件
let __GLOBAL_ACTIONS__;

export function mount(props) {
  __GLOBAL_ACTIONS__ = props; // 保存到全局变量
  renderApp();
}

// 业务组件中使用
export function updateUserStatus() {
  if (!window.__GLOBAL_ACTIONS__) return;
  
  window.__GLOBAL_ACTIONS__.setGlobalState({
    user: { status: 'active' }
  });
}
```
- 通过事件驱动更新: 在mount方法中监听事件，并调用相应的action做处理。
```js
// 主应用监听子应用事件
window.addEventListener('subapp-state-update', (e) => {
  actions.setGlobalState(e.detail);
});

// 子应用触发更新
document.getElementById('btn').addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('subapp-state-update', {
    detail: { settings: { darkMode: true } }
  }));
});
```

#### CustomEvent通信
这个是利用浏览器自身的事件机制实现，在某个应用中抛出事件，在另一个应用中监听：
```js
// 子应用A中
const event = new CustomEvent('cross-app-communication', {
  detail: {
    from: 'appA',
    message: 'Hello from App A',
    data: { /* 任意数据 */ }
  }
});
window.dispatchEvent(event);
```
子应用B监听并处理
```js
// 子应用B中
window.addEventListener('cross-app-communication', (event) => {
  console.log('Received event:', event.detail);
  // 处理来自其他子应用的数据
});
```

#### 性能优化
如果状态更新属于频繁操作，需要注意节流：
```js
// 对频繁更新进行节流
import { throttle } from 'lodash';
const throttledUpdate = throttle(actions.setGlobalState, 500);
```

### CSS隔离的问题
- 命名规范：需要对主应用和子应用的样式设置前缀，如main-, subapp1-
- css 模块：子应用需要使用CSS Modules 及 Scoped CSS，即子应用的样式需要设置生效的范围。
- 开启Shadow DOM模式：设置Qiankun的sandbox: { strictStyleIsolation: true }，但这也会带来新的问题，如弹窗组件，tooltip组件定位出错。

另外当主应用和子应用使用同一组件库，比如主应用使用ant-design5.x，子应用使用3.x，因为antd有很多的全局樟木，会导致冲突。
解决起来很麻烦，需要去改修改某个版本antd的样式前缀。

通常我们应该保持主应用的样式简洁，比如使用TailwindCSS或纯CSS Module实现。减少冲突的出现。

### 多运行时冲突
当中后台使用多标签页面开发，会同时有多个项目运行时，可能会发生样式冲突，甚至JS运行时错误，需要开启Shadow DOM和沙箱隔离：
```js
// 主应用注册子应用时配置
registerMicroApps([
  {
    name: 'subapp-antd3',
    entry: '//subapp1.com',
    sandbox: { 
      strictStyleIsolation: true,  // 启用 Shadow DOM 彻底隔离样式
      experimentalStyleIsolation: true, // 补充动态样式隔离
    }
  },
  {
    name: 'subapp-antd4',
    entry: '//subapp2.com',
    sandbox: { 
      strictStyleIsolation: true,
      experimentalStyleIsolation: true,
    }
  }
]);
```

### 性能优化
- 开启沙箱复用
```js
// 主应用注册子应用时配置
registerMicroApps([
  {
    name: 'subapp',
    entry: '//subapp.com',
    sandbox: { 
      speedy: true, // 启用快速沙箱（qiankun 2.0+）
      singleton: true, // 复用沙箱实例
    },
  }
]);
```
- 全局依赖共享
在主应用中引入公共的依赖，如React，高德地图API等。
子应用配置externals，不打包这些依赖。
- 子应卸载时需要清除事件监听、定时器、全局状态等。
```js
// 子应用入口文件
export async function unmount() {
  // 清理示例
  window.removeEventListener('resize', handleResize);
  clearInterval(timer);
  ReactDOM.unmountComponentAtNode(container);
}
```

- 子应用的预加载
如果应用不多，可以在初始化设置预加载所有的子应用
```js
// 主应用配置启动预加载
start({ 
  prefetch: 'all' // 预加载所有子应用资源
  // 或按需：prefetch: ['app1', 'app2']
});
```
如果应用过多，可以结合用户行为分析，比如hover某个菜单时预加载，通过 prefetchApps API实现。

### 错误处理
常见的错误有：
- 子应用加载失败：可以在应用注册时，添加errorHandler属性捕获
```js
// 主应用注册子应用时配置错误回调
registerMicroApps([
  {
    name: 'subapp',
    entry: '//subapp.example.com',
    container: '#container',
    activeRule: '/subapp',
    errorHandler: (error) => {
      // 1. 展示友好错误页面
      document.getElementById('container').innerHTML = `
        <div class="error-page">
          <h2>加载失败</h2>
          <button onclick="retryLoadSubapp()">重试</button>
        </div>
      `;
      // 2. 上报错误
      console.error('子应用加载失败:', error);
      trackError('LOAD_ERROR', error);
    },
  },
]);

// 手动重试逻辑
window.retryLoadSubapp = () => {
  window.history.pushState(null, null, '/subapp'); // 重新触发路由
};
```
- 子应用主动抛出的异常捕获
可以通过在props中传入onError之类的处理方法，让子应用上报错误信息
```js
// 子应用入口文件导出生命周期钩子时捕获异常
export async function mount(props) {
  try {
    ReactDOM.render(<App />, props.container);
  } catch (err) {
    // 1. 渲染降级内容
    props.container.innerHTML = '<div>子应用渲染异常，请联系管理员</div>';
    // 2. 上报错误
    props.onError(err); // 通过主应用传递的回调上报
  }
}
```

- 监听error事件，捕获其他异常
```js
// 主应用启动时监听全局错误
import { start } from 'qiankun';

start({
  sandbox: { 
    experimentalStyleIsolation: true 
  },
});

// 监听全局错误
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('subapp')) {
    // 识别子应用错误来源
    trackError('SUBPAPP_RUNTIME_ERROR', event.error);
    event.preventDefault(); // 阻止默认控制台打印
  }
});

// 监听未处理的 Promise 异常
window.addEventListener('unhandledrejection', (event) => {
  trackError('UNHANDLED_REJECTION', event.reason);
});
```


### qiankun使用总结
- css隔离性不好，主应用的样式会影响到子应用，需要使用前缀做下隔离
- vite的支持不好，虽然有vite-plugin-qiankun之类的插件，但是稳定性一般，对Vite的一些高级功能，比如 SSR，Legacy模式支持不好。另外对复杂的沙箱场景也会有出错。
- 当多个子应用同时运行时，比如中后台的多Tab标签，全局变量可能相互污染。
所以使用qiankun，技术方案最好与官方文档上的一致，比如构建工具使用Webpack。
