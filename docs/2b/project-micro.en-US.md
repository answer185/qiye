---
toc: content
group: 
  title: Project Experience
  order: 1
order: 4
---
# Micro-frontend Application

## Background
Traditional SPA applications, after a certain period of iteration, will gradually become monolithic applications, leading to the following problems:
- Team collaboration difficulties: After projects grow larger, teams are often divided by modules for development. If they still share code repositories, it leads to code conflicts, complex dependency management, high team communication costs, etc.
- Technology stack rigidity: Core architecture technology stacks are difficult to upgrade, new and better technical solutions are difficult to integrate. To ensure stability, only early technology stacks can be used for iteration.
- Deployment coupling: Any minor changes require full deployment, high risk, low efficiency.
- Performance bottlenecks: As component count increases, even with code splitting, lazy loading, etc., bundled code volume still becomes too large, first screen loading speed slows down.

## What is Micro-frontend
Micro-frontend is a technical means and method strategy for multiple teams to jointly build modern web applications through independent feature publishing.

Micro-frontend architecture has the following core values:
- **Technology stack agnostic**: Main framework doesn't limit access application technology stacks, micro-applications have complete autonomy
- **Independent development, independent deployment**: Micro-application repositories are independent, frontend and backend can develop independently, after deployment completion, main framework automatically completes synchronization updates
- **Incremental upgrade**: Facing various complex scenarios, we usually can't do full technology stack upgrades or refactoring for existing systems, and micro-frontend is a very good means and strategy for implementing progressive refactoring
- **Independent runtime**: Each micro-application has isolated state, runtime state is not shared

## Solutions
The main solution is to split projects. Based on business module relationships, usage frequency, etc., split projects into multiple ones, then combine into a whole after proper isolation and communication.以下是常见的拆分方案

### Multi-Page Application (MPA)
Jump to different independent pages through links, each page is an independent project. This solution:
- Advantages: Simple implementation
- Disadvantages:
  - Fragmented user experience, after switching to different pages, need to reinitialize entire framework
  - Application states cannot be shared, need to reinitialize through parameters, etc.
  - Duplicate resource loading: Resources between different pages, even if the same, need to be reloaded

### iframe Solution
After determining a main application framework, isolate corresponding sub-applications through iframe and routing.
- Advantages: Simple implementation, iframe is naturally a sandbox, can completely isolate CSS and JS, avoid conflicts
- Disadvantages:
  - Difficult communication, generally use postMessage to implement, maintenance and debugging are also troublesome
  - Poor performance: iframe itself is resource-intensive, when backend has multi-tab functionality, may cause multiple iframes to coexist, system lag
  - Duplicate resource loading: Each iframe corresponds to a sub-application, also needs to load all framework resources

### Micro-frontend Solutions
Mainly 3 implementation solutions:
- Route-based micro-frontend frameworks, represented by Qiankun, which adds sandbox isolation, resource preloading, etc. on top of Single-SPA
- Module Federation: Webpack 5 supports module sharing, allows cross-application dynamic code loading. Can reduce application volume by extracting modules and logic
- Web Components solution: Use browser's Shadow DOM for isolation. Current ecosystem is still weak. Representative framework is Tencent's Wujie

## Technology Selection
The company uses Qiankun, mainly because:
- Enterprise application products need optimal performance, so multi-page applications and iframe solutions are not considered
- Web Components ecosystem is still weak, and has browser requirements. Some of the company's customers still have older browser versions
- Webpack 5 Module Federation (MF) depends on Webpack 5, but old projects' webpack cannot be upgraded, and new projects also consider introducing Vite and Turbopack build tools, so not considered
- Alibaba's Qiankun and JD's MicroApp can both meet project needs. Choosing Qiankun mainly considers:
  - Company has DingTalk plugin development situations
  - Qiankun had larger ecosystem at the time
  - More widely used, more references when encountering problems

If choosing now, could consider JD's MicroApp, not based on Single-SPA, completely self-developed, so better isolation and performance than Qiankun. Also Qiankun hasn't had much updates in recent years, although backed by Alibaba, this project is clearly declining.

## qiankun Development
### Dynamic Application Registration
#### Code Implementation
Usually a system's sub-applications change dynamically. To avoid publishing main application every time there's a change, can dynamically register sub-applications through interfaces:
```js
// src/micro/apps-register.js
import { registerMicroApps, start } from 'qiankun';

let isQiankunStarted = false;

export async function registerDynamicApps() {
  // 1. Get sub-application configurations from interface
  const appConfigs = await fetchAppConfigs();
  
  // 2. Dynamically register sub-applications
  registerMicroApps(appConfigs, {
    beforeLoad: app => console.log('before load', app.name),
    beforeMount: app => console.log('before mount', app.name),
    afterUnmount: app => console.log('after unmount', app.name),
  });

  // 3. Start qiankun (only first call takes effect)
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
    props: { ...app.props } // Pass custom props
  }));
}
```
Need to ensure only started once.

Usually call dynamic registration function in App.jsx
```js
// src/App.jsx
import { useEffect } from 'react';
import { registerDynamicApps } from './micro/apps-register';

function App() {
  useEffect(() => {
    // Option 1: Register on application initialization
    registerDynamicApps();
    
    // Or Option 2: Register after user login
    // authStore.onLogin(() => registerDynamicApps());
  }, []);

  return (
    <div>
      <div id="subapp-container"></div>
    </div>
  );
}
```
If sub-applications depend on current logged-in user, can use option 2, register after user login completion.

#### Performance Optimization
Sub-application changes are not frequent, so requesting sub-application list interface every initialization would cause unnecessary waste. Considerable optimization solutions:
- Build in known sub-applications, register normally and start project first, then request configuration interface, dynamically append new sub-applications
- Embedded configuration: In index.html, dynamically add global variables like window.__MICRO_APPS_INITIAL__. Automatically sync update this file every time application updates
```js
<!-- Embed initial configuration in main application HTML template -->
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

### Sub-application Initialization
Using qiankun, sub-applications are best based on webpack. Main development work includes:
- public-path.js creation
```js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```
- Set history mode routing base, this value should match activeRule when registering application
```js
<BrowserRouter basename={window.__POWERED_BY_QIANKUN__ ? '/app-react' : '/'}>
```
- Modify entry index.js rendering method, add environment judgment and lifecycle functions
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
- Configure sub-application cross-origin, set build target to umd mode, and set library name
```js
const { name } = require('./package');

module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = 'umd';
    // webpack 5 needs to replace jsonpFunction with chunkLoadingGlobal
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

### State Sharing and Communication
#### initGlobalState Solution
initGlobalState is an API provided by qiankun. This method returns MicroAppStateActions, can set state listening and setting
In sub-applications, onGlobalStateChange, setGlobalState methods are passed through props.
```js
// Main application src/global-state.js
import { initGlobalState } from 'qiankun';

const initialState = { 
  user: { name: 'Admin', role: 'admin' },
  token: 'xxxx'
};

const actions = initGlobalState(initialState);

// Main application listen for changes
actions.onGlobalStateChange((state, prevState) => {
  console.log('Main application received state change:', state);
});

// Expose to sub-applications
export default actions;

// --------------------------------------------------
// Sub-application (React example) integration
export function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    // Respond to state changes
    console.log('Sub-application received:', state);
  });
  
  // Modify global state
  props.setGlobalState({ token: 'new-token' });
}
```

### CSS Isolation Issues
- Naming conventions: Need to set prefixes for main application and sub-application styles, such as main-, subapp1-
- CSS modules: Sub-applications need to use CSS Modules and Scoped CSS, i.e., sub-application styles need to set effective scope
- Enable Shadow DOM mode: Set Qiankun's sandbox: { strictStyleIsolation: true }, but this also brings new problems, such as modal components, tooltip component positioning errors

Also when main application and sub-applications use same component library, such as main application using ant-design 5.x, sub-application using 3.x, because antd has many global styles, conflicts occur.
Very troublesome to solve, need to modify some version antd style prefixes.

Usually we should keep main application styles simple, such as using TailwindCSS or pure CSS Module implementation. Reduce conflict occurrence.

### Multi-runtime Conflicts
When backend uses multi-tab page development, multiple projects run simultaneously, may cause style conflicts, even JS runtime errors. Need to enable Shadow DOM and sandbox isolation:
```js
// Main application register sub-applications configuration
registerMicroApps([
  {
    name: 'subapp-antd3',
    entry: '//subapp1.com',
    sandbox: { 
      strictStyleIsolation: true,  // Enable Shadow DOM for complete style isolation
      experimentalStyleIsolation: true, // Supplement dynamic style isolation
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

### Performance Optimization
- Enable sandbox reuse
```js
// Main application register sub-applications configuration
registerMicroApps([
  {
    name: 'subapp',
    entry: '//subapp.com',
    sandbox: { 
      speedy: true, // Enable fast sandbox (qiankun 2.0+)
      singleton: true, // Reuse sandbox instances
    },
  }
]);
```
- Global dependency sharing
Introduce public dependencies in main application, such as React, Amap API, etc.
Sub-applications configure externals, don't bundle these dependencies
- Sub-application unmounting needs to clear event listeners, timers, global state, etc.
```js
// Sub-application entry file
export async function unmount() {
  // Cleanup example
  window.removeEventListener('resize', handleResize);
  clearInterval(timer);
  ReactDOM.unmountComponentAtNode(container);
}
```

- Sub-application preloading
If not many applications, can set preload all sub-applications on initialization
```js
// Main application configuration startup preloading
start({ 
  prefetch: 'all' // Preload all sub-application resources
  // Or on-demand: prefetch: ['app1', 'app2']
});
```
If too many applications, can combine user behavior analysis, such as preload when hovering certain menus, implement through prefetchApps API.

### Error Handling
Common errors include:
- Sub-application loading failure: Can add errorHandler property when registering applications to capture
```js
// Main application register sub-applications error callback configuration
registerMicroApps([
  {
    name: 'subapp',
    entry: '//subapp.example.com',
    container: '#container',
    activeRule: '/subapp',
    errorHandler: (error) => {
      // 1. Show friendly error page
      document.getElementById('container').innerHTML = `
        <div class="error-page">
          <h2>Loading Failed</h2>
          <button onclick="retryLoadSubapp()">Retry</button>
        </div>
      `;
      // 2. Report error
      console.error('Sub-application loading failed:', error);
      trackError('LOAD_ERROR', error);
    },
  },
]);

// Manual retry logic
window.retryLoadSubapp = () => {
  window.history.pushState(null, null, '/subapp'); // Re-trigger routing
};
```

### qiankun Usage Summary
- CSS isolation not good, main application styles affect sub-applications, need to use prefixes for isolation
- Poor Vite support, although there are plugins like vite-plugin-qiankun, stability is average, poor support for Vite advanced features like SSR, Legacy mode. Also errors in complex sandbox scenarios
- When multiple sub-applications run simultaneously, such as backend multi-tab, global variables may pollute each other
So using qiankun, technical solutions best match official documentation, such as using Webpack for build tools
