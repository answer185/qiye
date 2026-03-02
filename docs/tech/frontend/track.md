---
toc: content
group: 
  title: 场景方案
  order: 2
order: 1
---
# 前端埋点与监控
## 概念
前端埋点是指在网页或者应用程序中插入特定的代码，用于收集用户的行为数据并发送给服务器进行分析。这些数据可以包括用户的点击、浏览、输入等操作，帮助开发者了解用户的在其网站中的行为，从而进行针对性的优化和改进。
前端埋点通常包括以下几个步骤：
1. 定义事件：定义需要收集的数据事件，如点击、浏览等。
2. 添加代码：在网页或应用程序中添加特定的代码，用于收集事件数据。
3. 发送数据：将收集到的数据发送给服务器进行分析。
4. 分析数据：对收集到的数据进行分析和挖掘，找出用户行为规律和需求，为产品的改进和优化提供依据。

## 前端监控
### 数据监控
主要关注用户在网站或应用中的行为和交互
- PV：即页面浏览量或点击量；
- UV：指访问某个站点或点击某条新闻的不同 IP 地址的人数
- 用户在每一个页面的停留时间
- 用户通过什么入口来访问该网页
- 用户在相应的页面中触发的行为
### 性能监控
主要关注网站或应用的加载速度、响应时间和用户体验等方面
- 不同用户，不同机型和不同系统下的首屏加载时间
- 白屏时间
- http 等请求的响应时间
- 静态资源整体下载时间
- 页面渲染时间
- 页面交互动画完成时间
### 异常监控
主要关注网站或应用在运行过程中是否出现错误或异常
- Javascript 的异常监控
- 样式丢失的异常监控

## 性能数据
### 上报的数据
常用的有：
- unload: 前一个页面的卸载时间，通过unloadEventEnd-unloadEventStart算出
- redirect: 重定向耗时，redirectEnd - redirectStart
- appCache: 缓存耗时, domainLookupStart - fetchStart
- dns: DNS 解析耗时,domainLoopupEnd - domainLookupStart
- tcp: TCP 连接耗时, connectEnd - connectStart
- response: 响应数据传输耗时, responseEnd - responseStart
- 首次渲染耗时：responsedEnd - fetchStart
- 首次可交互时间：domInteractive - fetchStart
等。
根据实际需要计算。

### 数据的获取方式
#### window.performance.timing
虽然浏览器还支持，但是已经从Web标准中移除。

#### PerformanceNavigationTiming
可以通过window.performance.getEntriesByType('navigation');来获取
```js
// 获取当前页面的导航计时数据（返回数组）
const navigationEntries = performance.getEntriesByType('navigation');

// 通常取第一个元素（即当前页面导航记录）
const navigationTiming = navigationEntries[0];

// 关键指标示例（单位：毫秒，实际存储为纳秒级浮点数）
console.log({
  // 关键阶段耗时
  dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
  tcp: navigationTiming.connectEnd - navigationTiming.connectStart,
  ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
  
  // 重要时间点（相对于performance.timeOrigin）
  loadEventEnd: navigationTiming.loadEventEnd,
  domComplete: navigationTiming.domComplete
});
```
#### 数据上报

监听load事件，通过navigator.sendBeacon()上报，避免阻塞页面卸载
```js
// 综合监控示例
function collectPerfMetrics() {
  // 1. 导航时序数据
  const [navTiming] = performance.getEntriesByType('navigation');
  
  // 2. 资源加载数据
  const resources = performance.getEntriesByType('resource');
  
  // 3. 关键业务指标（如FP/FCP）
  const paintEntries = performance.getEntriesByType('paint');
  
  return {
    navigation: {
      dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
      tcp: navTiming.connectEnd - navTiming.connectStart,
      ttfb: navTiming.responseStart - navTiming.requestStart,
      domReady: navTiming.domContentLoadedEventEnd - navTiming.startTime,
      fullLoad: navTiming.loadEventEnd - navTiming.startTime
    },
    resources: resources.map(r => ({
      url: r.name,
      type: r.initiatorType,
      duration: r.duration
    })),
    paints: {
      firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime,
      firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime
    }
  };
}

// 在适当时机触发采集
window.addEventListener('load', () => {
  setTimeout(() => {  // 等待所有资源加载完成
    const metrics = collectPerfMetrics();
    navigator.sendBeacon('/api/perf', JSON.stringify(metrics));
  }, 0);
});
上面的上报方式，可能会遗漏掉LCP的数据，最好是通过PerformanceObserver来观察并上报需要的类型：
function sendMetric(metricName, value) {
  const data = {
    name: metricName,
    value: value,
    page: location.href,
    timestamp: Date.now()
  };
  
  // 使用sendBeacon上报（推荐方案）
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  navigator.sendBeacon('/api/perf-metrics', blob);
}

// 性能监控专用Observer
const perfObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    switch (entry.entryType) {
      case 'navigation':
        handleNavigationTiming(entry);
        break;
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          sendMetric('FCP', entry.startTime);
        }
        break;
      case 'largest-contentful-paint':
        sendMetric('LCP', entry.renderTime || entry.loadTime);
        break;
    }
  });
});

// 启动监控（同时监听多种类型）
perfObserver.observe({
  entryTypes: [
    'navigation',
    'paint',
    'largest-contentful-paint',
    'first-input'
  ]
});

// 单独监听CLS（布局偏移）
const clsObserver = new PerformanceObserver((list) => {
  let cumulativeLayoutShift = 0;
  list.getEntries().forEach(entry => {
    if (!entry.hadRecentInput) cumulativeLayoutShift += entry.value;
  });
  sendMetric('CLS', cumulativeLayoutShift);
});

clsObserver.observe({ type: 'layout-shift', buffered: true });
```
### 性能标识设计
上报的性能数据需要有唯一的标识，方便查询。可以通过以下参数来区分：
1. 用户标识：
  - 用户ID（如果系统有登录用户体系）
  - 匿名用户ID（可以使用cookie/localStorage存储的UUID）
2. 设备/环境信息：
  - User Agent（包含浏览器、操作系统信息）
  - 屏幕分辨率（window.screen.width和window.screen.height）
  - 设备类型（可通过User Agent判断或navigator.userAgentData.mobile）
  - 网络类型（navigator.connection.effectiveType）
3. 页面信息：
  - 完整URL（window.location.href）
  - 页面路径（window.location.pathname）
  - 查询参数（如果需要单独分析）
  - 页面标题（document.title）
4. 会话信息：
  - 会话ID（每次访问生成唯一ID）
  - 访问时间戳
示例代码：
```js
// 生成或获取用户ID
function getUserId() {
  let userId = localStorage.getItem('performanceUserId');
  if (!userId) {
    userId = 'user-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('performanceUserId', userId);
  }
  return userId;
}

// 生成会话ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('performanceSessionId');
  if (!sessionId) {
    sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('performanceSessionId', sessionId);
  }
  return sessionId;
}

// 收集性能数据并上报
function collectAndReportPerformance() {
  const performanceData = {
    // 用户和会话信息
    userId: getUserId(),
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    
    // 设备信息
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    connectionType: navigator.connection?.effectiveType || 'unknown',
    
    // 页面信息
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer,
    
    // 性能指标
    ...getPerformanceMetrics()
  };
  
  // 使用sendBeacon上报
  const blob = new Blob([JSON.stringify(performanceData)], {type: 'application/json'});
  navigator.sendBeacon('/api/performance', blob);
}

// 获取具体性能指标
function getPerformanceMetrics() {
  // 这里使用PerformanceObserver和PerformanceNavigationTiming获取具体指标
  // 返回如loadTime, FCP, LCP等指标
}
```
## 业务埋点数据
### 埋点的分类
- 页面行为：如：页面访问和停留时间
- 交互行为：如：点击和滚动
- 系统行为：如：启动、崩溃
当然还可以按其他维护来分类，如按业务层，技术实现方式等。
### 埋点方案
#### 手动埋点
这也是最常用的方案，其流程一般为：
- 产品经理确定每个事件的名称，
- 使用第三方或企业内部自研的埋点SDK，在合适的位置添加相应的调用代码。

优点是灵活性高，可以精确捕获各种复杂的用户行为。
缺点是开发成本较高，且需要一定的技术门槛。

#### 可视化埋点
其原理是:
- 通过一个可视化的系统管理页面及埋点配置生成相应的埋点规则。一般为JSON配置文件。
- 在埋点的SDK里动态加载该配置
- 解析该配置，并做埋点上报
相对于手动埋点，其优点是：
- 埋点的维护成本低：后续基本上由非技术人员操作
- 可集中管理埋点需求
缺点：
- 初期成本高：需要搭建配置平台。
- 灵活性没有手动配置高：超出配置规则则不行。
- 准确性没有手动配置高：比如依赖的class选择器变化，可能同一个事件的数据分成两个。

可以基于开源系统二次开发，如：
- Mixpanel
- Matomo
- OpenReplay
等。

#### 无痕埋点
其原理是做全局监听，通过劫持或监听全局事件（点击、滚动、页面跳转等），自动记录用户交互行为。
一般通过CSS选择器+层级的路径来生成事件标识。

**优点：**
- 无需手动添加跟踪代码，可以大幅降低开发成本。

**缺点：**
- 会采集到大量冗余数据，难以精确捕获一些复杂的用户行为。
- 需要对数据进行过滤。

开源的项目有：rrweb

### 其他的埋点方案
#### vue指令的方式
通过指令传入事件名称，然后上报
```js
Vue.directive('collect', {
    inserted(el, binding) {
        const { value } = binding;
        if (value) {
            // 这里需要节点进行显式声明，以便后续对埋点事件进行拓展
            const { click = false } = binding.modifiers;
            if (click) {
                // 这里对元素进行绑定 从而实现注入
                el.addEventListener(
                    'click',
                    event => {
                        // doSomething...
                    },
                    false
                );
            }
        } else {
            throw new Error('xxxxx');
        }
    },
    unbind(el, bingding) {
        // doSomething....
    }
});
```
#### 在元素上添加dataset标识
比如data-track-id及data-params，然后由统一事件捕获，寻找所有带相关标识的元素，并做监听和上报。
```html
<button data-track-id="product_123_buy">购买</button>
```
#### 错误数据上报
通过监听error事件捕获错误
```js
window.addEventListener('error', e => {
    console.log('e: ', e);
})
```
promise的错误捕获：
```js
window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    e.preventDefault();

    e.promise.catch((error) => {
        // 区分 promise 的两种错误消息
        let msg = error?.message || error;
        this.sendData({ type: 'promise', msg })
    })
})
```
资源加载错误，通过错误类型区分：
```js
window.addEventListener('error', e => {
    e.preventDefault();

    // 判断错误类型
    const isErrorEvent: Boolean = e instanceof ErrorEvent;

    if (!isErrorEvent) { // 资源加载错误
        this.sendData(
            {
                type: 'resource',
                msg: e.message,
            }
        );
        return;
    }

    this.sendData( // js 错误
        {
            type: 'js',
            msg: e.message,
        }
    )

}, true)
```
## 数据上报的方式
### XHR接口
通过对接后端接口上传数据，需要注意跨域问题。

### img标签
伪装成一个图片URL的请求，避免跨域问题。不足是有URL的长度限制，所以对大数据量的上报场景不可用。

### sendBeacon
上面的两种方法都存在刷新后数据丢失的问题，可以使用sendBeacon()解决。
sendBeacon() 方法用于将数据异步传输到服务器，通常用于收集用户行为数据或跟踪用户活动。该方法可以确保数据在页面关闭或刷新之前发送给服务器，从而避免数据丢失。
```js
navigator.sendBeacon('http://127.0.0.1:5500/data', JSON.stringify({
    event: 'pageview',
    url: window.location.href,
    time: Date.now()
}));
```

不足是：可能存在浏览器兼容性问题。

## 总结
前端埋点与监控是优化用户体验和产品迭代的核心工具，通过采集用户行为（点击、浏览）、性能指标（LCP、FID）和异常数据（JS错误、资源加载失败），帮助开发者精准分析问题。上面的内容并非全部，比如，在实际开发中还需要考虑SDK及弱网时上报或上报失败后重试的情况。
