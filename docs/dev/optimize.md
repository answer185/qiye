---
toc: content
group: 
  title: 前端工程
  order: 1
order: 4
---
# 前端优化
## 概述
前端优化是前端架构里的一个重要环节。理论上，在条件允许的情况下，任何的项目都应该是追求极致的性能，因为这直接与用户体验、SEO排名及转化率这些重要的因素相关。

## 指标
不管什么样的优化手段，最终都应该要有相应的指标来衡量。按照运行的阶段，可以分为：加载阶段指标、交互阶段指标、资源和运行时指标。
### 加载阶段指标
- FP（First Paint）：首次像素渲染（白屏→任何像素变化）。
- FCP（First Contentful Paint）：首次内容渲染（文本、图片等）。
- LCP（Largest Contentful Paint）：最大内容渲染时间（应 <2.5s）。
- TTI（Time to Interactive）：页面可交互时间（主线程空闲）。
### 交互阶段指标
- TBT（Total Blocking Time）：主线程阻塞总时间（应 <300ms）。
- CLS（Cumulative Layout Shift）：累计布局偏移（应 <0.1）。
### 资源与运行时指标
- 文件大小：JS/CSS/图片体积（如首屏资源 <100KB）。
- 启动时间：项目的启动时间。
- 构建时间：项目的构建时间。
- HTTP 请求数：减少非必要请求（合并、懒加载）。
- 主线程占用：长任务（>50ms）导致卡顿，可通过 Chrome DevTools 的 Performance 面板分析。
- 内存占用：避免内存泄漏的情况发生

上面的数据，可以通过PerformanceNavigationTiming、PerformanceObserver对象及浏览器的Performance选项卡获取到。

## 启动&构建优化
### 配置模块查找范围
通过 resolve 选项配置模块的查找范围和文件扩展名。
```js
// 模块解析
resolve: {
  // 解析模块时应该搜索的目录
  modules: ['node_modules'],
  extensions: ['.ts', '.tsx', '.js', '.jsx'], // 查找模块时，为不带扩展名的模块路径，指定要查找的文件扩展名
  ...
},
```

### 配置 babel-loader 编译范围
通过 exclude、include 配置来确保编译尽可能少的文件。
```js
const path = require("path");
module.exports = {
  //...
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        use: ["babel-loader"],
        include: [path.resolve(__dirname, "src")],
      },
    ],
  },
};
```

### 开启 babel-loader 编译缓存
设置 cacheDirectory 属性开启编译缓存，避免 Webpack 在每次构建时产生高性能消耗的 Babel 编译过程。
```js
{
  test: /\.(js|mjs|jsx|ts|tsx)$/,
  include: [path.resolve(context, 'src')],
  loader: require.resolve('babel-loader'),
  options: {
    ...
    // 开启编译缓存，缓存 loader 的执行结果（默认缓存目录：node_modules/.cache/babel-loader），提升构建速度（作用和单独使用 cache-loader 一致）
    cacheDirectory: true,
    // 配合 cacheDirectory 使用，设置 false 禁用缓存文件压缩，这会增加缓存文件的大小，但会减少压缩的消耗时间，提升构建速度。
    cacheCompression: false,
  }
},
```

### 启用多进程对 JS 代码压缩
在使用 TerserWebpackPlugin 对 JS 代码进行压缩时，默认选项 parallel = true 就开启了多进程并发运行，以提高构建速度。
```js
new TerserWebpackPlugin({
  // 使用多进程并发运行以提高构建速度。并发运行的默认数量：os.cpus().length - 1。
  parallel: true,
  ...
}),
```

### 启用webpack缓存
- 缓存：
```js
module.exports = {
  cache: { type: 'filesystem' }, // 持久化缓存
};
```
### 其他优化
- 依赖预构建：node_modules 转为 ESM，加速冷启动。
- ESM 按需加载：浏览器原生支持，无需打包（Vite）。
- Code Splitting：动态导入 + SplitChunksPlugin。
- Tree Shaking：移除未引用代码（需 ES Module 语法）。
- 提取外部资源：如React/Vue框架的包，这些基本没变化。
## 资源加载优化
### HTTP/2 + GZIP/Brotli
- HTTP/2：多路复用，解决队头阻塞。
- Brotli/Gzip：压缩静态资源（Nginx 配置示例）
### CDN与缓存策略（Cache-Control、ETag）  
- CDN：分发静态资源，减少 RTT。
- 缓存控制：
```html
<meta http-equiv="Cache-Control" content="max-age=31536000">
```
### 减少资源体积
除了上面的GZIP压缩外，还可以通过以下手段减少资源的体积：
- 通过路由级及组件级的懒加载策略，拆分代码。
- Tree Shaking，过滤掉没用的代码。
- 使用Uglify/terser等工具压缩代码。
如果处理后，项目的主文件还是过大，使用Webpack的 splitChunks进行拆包。
还需要使用webpack-bundler-analyser之类的工具，分析打包的内容，优化各种依赖，减少没用到的内容被打包进去。

### 减少HTTP请求
可以的话，将一些小文件合并成一个大文件。
一些分散的配置接口也可以合并成一个。

### 资源位置优化
css文件放在头部，Javascript文件放在底部

### 使用字体图标iconfont代替图片图标
字体图标就是将图标制作成一个字体，使用时就跟字体一样，可以设置属性，例如 font-size、color 等等，非常方便。并且字体图标是矢量图，不会失真。还有一个优点是生成的文件特别小

### 预加载（Preload/Prefetch）
预加载是一种通过提前加载资源来提升用户体验的技术，可以减少用户等待时间，提高页面响应速度。常用的预加载技术包括：
1. <link rel="preload"> - 提前加载关键资源
2. <link rel="prefetch"> - 空闲时加载未来可能需要的资源
3. <link rel="preconnect"> - 提前建立与第三方源的连接
4. <link rel="dns-prefetch"> - 提前进行DNS解析
5. 图片/数据预加载 - 提前加载图片或数据

## 运行时优化
### 防抖和节流
- 防抖（Debounce）：连续事件结束后触发（如搜索框）。
- 节流（Throttle）：固定间隔触发（如滚动事件）。
防抖的代码：
```js
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer); // 清除之前的计时
    timer = setTimeout(() => {
      fn.apply(this, args); // 延迟执行
    }, delay);
  };
}

// 使用示例
const searchInput = document.getElementById('search');
const handleSearch = () => console.log('发起搜索请求');

searchInput.addEventListener('input', debounce(handleSearch, 500));
节流的代码：
function throttle(fn, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

// 使用示例
window.addEventListener('scroll', throttle(() => {
  console.log('检查是否滚动到底部');
}, 200));
```

### 图片优化
- 格式选择：WebP（比 JPEG 小 30%）。
- 图片的动态裁剪：阿里云和七牛等提供的图片处理，通过添加参数，可以生成合适大小的图片。
  - 只需在图片的url地址上动态添加参数，就可以得到你所需要的尺寸大小，比如：http://7xkv1q.com1.z0.glb.clouddn.com/grape.jpg?imageView2/1/w/200/h/200
- 图片的懒加载: 当用户浏览到相应区域后才展示图片，其原理是：通过 html5 自定义属性 data-xxx 先暂存 src 的值，然后在图片出现在屏幕可视区域的时候，再将 data-xxx 的值重新赋值到 img 的 src 属性即可。
- 使用字体图标代替小图标：
字体图标是页面使用小图标的不二选择，最常用的就是 iconfont
字体图标的优点：
1）轻量级：一个图标字体要比一系列的图像要小。一旦字体加载了，图标就会马上渲染出来，减少了 http 请求
2）灵活性：可以随意的改变颜色、产生阴影、透明效果、旋转等
3）兼容性：几乎支持所有的浏览器，请放心使用
- 图片转 base64 格式
将小图片转换为 base64 编码字符串，并写入 HTML 或者 CSS 中，减少 http 请求
转 base64 格式的优缺点：
1）它处理的往往是非常小的图片，因为 Base64 编码后，图片大小会膨胀为原文件的 4/3，如果对大图也使用 Base64 编码，后者的体积会明显增加，即便减少了 http 请求，也无法弥补这庞大的体积带来的性能开销，得不偿失
2）在传输非常小的图片的时候，Base64 带来的文件体积膨胀、以及浏览器解析 Base64 的时间开销，与它节省掉的 http 请求开销相比，可以忽略不计，这时候才能真正体现出它在性能方面的优势
项目可以使用 url-loader 将图片转 base64：
```js
// 安装
npm install url-loader --save-dev
    
// 配置
module.exports = {
  module: {
    rules: [{
        test: /.(png|jpg|gif)$/i,
        use: [{
            loader: 'url-loader',
            options: {
              // 小于 10kb 的图片转化为 base64
              limit: 1024 * 10
            }
        }]
     }]
  }
};
```

### 框架优化
每个框架都有提供自身的优化策略，需要理解框架的渲染原理并掌握框架提供的性能优化API，以编写出执行效率更高的代码。
以React为例，理解其渲染过程后，我们发现影响性能的因素如下：
- React根据props、state、context等数据精确计算出需要更新的DOM节点
- 组件的props、state、context发生变化后，会触发组件的更新。
- 在组件更新后，会重新执行相关的数据计算和函数。
- 对于列表的组件，当key没有变化时，不会重新渲染元素。
因此，我们在开发时需要注意：
- 区分数据的变化部分和不变的部分，合理设计props、state等的数据结构。
- 使用React.memo缓存组件，在相关依赖没变化时，不更新。
- 使用useMemo缓存计算的数据，在相关依赖没变化时，不更新。
- 使用useCallback管理函数的执行，在相关依赖不变时，不再次调用。
React会自动合并多个状态更新操作，但是在React17时，函数式组件的useState还是会触发多次，如果版本较低，需要注意优化。
长列表优化
在实际项目中，经常会遇到大数据列表展示的情况，比如数据有1000，如果原样展示，将会生成至少 1000个DOM节点，这会大大提高浏览器的渲染负担。
而对用户来说，它关心的只是展示区域的数据。所以我们只要展示用户当前可视区域的数据项即可。
其实现原理是：结合滚动条 top 位置和容器的可视区域，计算出这个区间的数据项，渲染到滚动容器中。

### 计算优化
#### 算法优化
对于复杂的计算，我们需要做复杂度分析（大O表示法），分析代码的执行效率和内存占用情况。
如：从数组中寻找多条数据的代码，一个不注重效率的代码可能如下：
```js
const list = [
  { cityId: "bj", cityName: "北京" },
  { cityId: "sh", cityName: "上海" },
  { cityId: "gz", cityName: "广州" },
  { cityId: "sz", cityName: "深圳" },
];

const bj = list.find((item) => item.cityId === "bj");
const sh = list.find((item) => item.cityId === "sh");
const gz = list.find((item) => item.cityId === "gz");
const sz = list.find((item) => item.cityId === "sz");

每个find都要遍历一次，复杂度是O(n^2)，正常应该一个循环获取完成，复杂度为O(n)
const list = [
  { cityId: "bj", cityName: "北京" },
  { cityId: "sh", cityName: "上海" },
  { cityId: "gz", cityName: "广州" },
  { cityId: "sz", cityName: "深圳" },
];

const cityMap = {};

list.forEach((city) => {
  cityMap[city.cityId] = city;
});

const { bj, sh, gz, sz } = cityMap;
```
#### Web Worker
如果遇到一个计算，导致页面卡顿时，就需要考虑使用web workder优化，将计算移至子线程。常见的场景，比如对图片做模糊处理，canvas绘制。以下是图片滤镜的代码：
主线程逻辑（UI交互）：
```js
<!-- index.html -->
<input type="file" id="image-upload" accept="image/*" />
<button id="apply-filter">应用灰度滤镜</button>
<img id="preview" />
<script src="main.js"></script>
// main.js
const worker = new Worker('image-worker.js');

document.getElementById('apply-filter').addEventListener('click', () => {
  const file = document.getElementById('image-upload').files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const image = new Image();
    image.onload = () => {
      // 将图像数据传递给 Worker
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 发送数据到 Worker
      worker.postMessage(imageData, [imageData.data.buffer]); // 转移所有权，避免拷贝
    };
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// 接收 Worker 处理结果
worker.onmessage = (e) => {
  const canvas = document.createElement('canvas');
  canvas.width = e.data.width;
  canvas.height = e.data.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(e.data, 0, 0);

  // 显示处理后的图像
  document.getElementById('preview').src = canvas.toDataURL();
};
Web Worker进程
// image-worker.js
self.onmessage = (e) => {
  const imageData = e.data;
  const pixels = imageData.data;

  // 灰度化计算（遍历所有像素）
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b; // 灰度公式
    pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
  }

  // 返回处理后的数据
  self.postMessage(imageData, [imageData.data.buffer]); // 转移所有权
};
```
#### 时间切片
对于计算复杂，且涉及到需要操作DOM，任务可以拆分的场景，比如长列表渲染的场景，需要使用时间切片的方案，将计算拆分成多个任务，比如将要计算的数组列表数据，拆分成10个，然后使用requestIdleCallback 或setTimeout分开执行。这样不会阻塞主进程。
setTimeout的例子：
```js
function processLargeArray(array, chunkSize = 100, callback) {
  let index = 0;
  function processChunk() {
    const chunk = array.slice(index, index + chunkSize);
    chunk.forEach(item => callback(item));
    index += chunkSize;
    if (index < array.length) {
      setTimeout(processChunk, 0); // 将剩余任务放入下一个事件循环
    }
  }
  processChunk();
}

// 使用示例
processLargeArray(hugeArray, 100, (item) => {
  renderItem(item); // 渲染单条数据
});
requestIdleCallback的例子：
function processTaskInIdleTime(tasks) {
  function runNextTask(deadline) {
    while (deadline.timeRemaining() > 0 && tasks.length > 0) {
      const task = tasks.shift();
      task(); // 执行单个任务
    }
    if (tasks.length > 0) {
      requestIdleCallback(runNextTask); // 继续处理剩余任务
    }
  }
  requestIdleCallback(runNextTask);
}

// 使用示例
const tasks = Array.from({ length: 1000 }, (_, i) => () => {
  console.log(`Processing task ${i}`);
});
processTaskInIdleTime(tasks);
```
实际上，React的调节算法使用的就是这个方案，拆分渲染任务，并设置优先级，使用requestIdleCallback，在空闲的时候执行，并允许高优先级的任务优先执行。
#### 时间切片+Web Worker的优化
在实际应用中，经常也需要使用上诉两种方案结合来做优化，如大文件的切片上传，在切片后，需要计算文件的Hash，以保证在服务端接收合并时，收到正确的文件，而文件的Hash计算属于耗时的任务，就需要交给Worker。
#### 并行计算
对于多个不相关的任务，且可以异步执行的，可以考虑使用Promise.all来做伪并行优化，比如多个不相关的数据请求，当然，前提是TCP连接数允许的情况。
```js
const tasks = [
  fetch('/api/data1'),
  fetch('/api/data2'),
  fetch('/api/data3'),
];

Promise.all(tasks).then((results) => {
  console.log(results); // 所有请求完成后触发
});
```
JavaScript 主线程通过事件循环调度异步任务，任务本身（如网络请求）由浏览器底层多线程处理，但回调逻辑仍在主线程运行。

如果需要真正的多线程并行方案，需要使用Web Worker：
```js
// 主线程
const worker1 = new Worker('worker.js');
const worker2 = new Worker('worker.js');

worker1.postMessage(bigFile1);
worker2.postMessage(bigFile2);

// worker.js
self.onmessage = (e) => {
  const result = heavyCalculation(e.data); // 在子线程运行
  self.postMessage(result);
};
```

### HTTP缓存优化
浏览器支持对HTTP请求的文件进行缓存，可以结合构建文件的Hash名，缓存没更新的文件。
对于SPA应用，要注意不要缓存index.html。

### 数据缓存优化
为了提升二次访问速度，会对已访问的数据进行缓存，数据可以存在在内存变量中，也可以在浏览器的本地缓存中。
需要注意的是，不管哪种缓存方式，都要注意空间的使用，我们可以使用LRU算法来保证数据在一个合理的范围。
### 减少重排和重绘
重排：当改变 DOM 元素位置或大小时，会导致浏览器重新生成渲染树，这个过程叫重排。
重绘：当重新生成渲染树后，就要将渲染树每个节点绘制到屏幕，这个过程叫重绘。不是所有的动作都会导致重排，例如改变字体颜色，只会导致重绘。记住，重排会导致重绘，重绘不会导致重排 。
重排和重绘这两个操作都是非常昂贵的，因为 JavaScript 引擎线程与 GUI 渲染线程是互斥，它们同时只能一个在工作。

### 其他
- 判断条件多时：使用switch，而不是if-else。
  - 当两者都不是最好选择时，比如过多，使用查找表，可以使用数组或对象来构建。
- 使用flexbox而不是较早的布局模型，如表格。

## 交互优化
### 白屏优化
减少白屏要用到上面说的各种优化策略，其中尤其要注意：
- 减少打包体积，非必要资源按需加载。
- 使用SSR框架。
- 虚拟化展示。
- 增加骨架屏。

### 加载过程提示
增加进度条或呈现过渡动画

### 响应式图片
根据设备的屏幕尺寸、分辨率和网络条件，智能加载最适合的图片资源，从而在保证视觉效果的同时减少不必要的带宽消耗。
其实实现方式有：
#### srcset+sizes
```html
<img src="default.jpg"  <!-- 兜底图片 -->
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 800px"
  alt="响应式图片"
>
```
#### picture 元素
```html
<picture>
  <!-- 窄屏：竖版裁剪图 -->
  <source media="(max-width: 600px)" srcset="portrait.webp" type="image/webp">
  <source media="(max-width: 600px)" srcset="portrait.jpg" type="image/jpeg">

  <!-- 宽屏：横版原图 -->
  <source srcset="landscape.webp" type="image/webp">
  <source srcset="landscape.jpg" type="image/jpeg">

  <!-- 兜底（不支持picture的浏览器） -->
  <img src="landscape.jpg" alt="响应式图片">
</picture>
```
#### CSS 媒体查询 + 背景图
```css
.banner {
  background-image: url("small.jpg");
}

@media (min-width: 600px) {
  .banner {
    background-image: url("large.jpg");
  }
}
```
还有通过js实现，这个不推荐，会导致重绘和回流。
### 骨架屏（Skeleton Screen）  
- 占位预览，减少布局偏移（CLS）。

### 动画优化（CSS 动画、GPU 加速）  
- 使用 transform 和 opacity（触发 GPU 加速）。
- 避免频繁 reflow（如修改 width）。
### 错误边界与降级处理
这里的目标是优化错误提示，可以使用try...catch,或像React的componentDidCatch来捕获组件的错误，在发生错误时，展示回退的内容。
### 防止重复提交（按钮禁用、请求拦截） 
按钮禁用 + 请求拦截：
```js
const [loading, setLoading] = useState(false);
const handleSubmit = () => {
  if (loading) return;
  setLoading(true);
  // 发起请求...
};
```
## 相关工具
- 检测：Lighthouse、WebPageTest。
- 监控：Sentry、Performance API。

## 总结
上面的内容是我日常优化的自检清单。在实际开展的过程中，应结合项目的实际情况、时间和团队情况来开展。避免过度优化。



