---
toc: content
group: 
  title: Frontend Engineering
  order: 1
order: 4
---
# Frontend Optimization

## Overview
Frontend optimization is an important part of frontend architecture. Theoretically, under conditions permitting, any project should pursue ultimate performance, as this is directly related to important factors such as user experience, SEO rankings, and conversion rates.

## Metrics
Regardless of what optimization methods are used, there should ultimately be corresponding metrics to measure. According to the running stage, they can be divided into: loading stage metrics, interaction stage metrics, and resource and runtime metrics.

### Loading Stage Metrics
- FP (First Paint): First pixel rendering (white screen → any pixel change).
- FCP (First Contentful Paint): First content rendering (text, images, etc.).
- LCP (Largest Contentful Paint): Largest content rendering time (should be <2.5s).
- TTI (Time to Interactive): Page interactive time (main thread idle).

### Interaction Stage Metrics
- TBT (Total Blocking Time): Total main thread blocking time (should be <300ms).
- CLS (Cumulative Layout Shift): Cumulative layout shift (should be <0.1).

### Resource and Runtime Metrics
- File size: JS/CSS/image volume (e.g., first screen resources <100KB).
- Startup time: Project startup time.
- Build time: Project build time.
- HTTP request count: Reduce unnecessary requests (merge, lazy loading).
- Main thread usage: Long tasks (>50ms) cause stuttering, can be analyzed through Chrome DevTools Performance panel.
- Memory usage: Avoid memory leaks

The above data can be obtained through PerformanceNavigationTiming, PerformanceObserver objects, and the browser's Performance tab.

## Startup & Build Optimization
### Configure Module Search Scope
Configure module search scope and file extensions through resolve options.
```js
// Module resolution
resolve: {
  // Directories to search when resolving modules
  modules: ['node_modules'],
  extensions: ['.ts', '.tsx', '.js', '.jsx'], // When looking for modules, specify file extensions to look for for module paths without extensions
  ...
},
```

### Configure babel-loader Compilation Scope
Configure exclude and include to ensure compilation of as few files as possible.
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

### Enable babel-loader Compilation Cache
Set cacheDirectory property to enable compilation cache, avoiding high-performance consuming Babel compilation process in Webpack during each build.
```js
{
  test: /\.(js|mjs|jsx|ts|tsx)$/,
  include: [path.resolve(context, 'src')],
  loader: require.resolve('babel-loader'),
  options: {
    ...
    // Enable compilation cache, cache loader execution results (default cache directory: node_modules/.cache/babel-loader), improve build speed (same effect as using cache-loader separately)
    cacheDirectory: true,
    // Use with cacheDirectory, set false to disable cache file compression, this increases cache file size but reduces compression time, improving build speed.
    cacheCompression: false,
  }
},
```

### Enable Multi-process JS Code Compression
When using TerserWebpackPlugin to compress JS code, the default option parallel = true enables multi-process concurrent execution to improve build speed.
```js
new TerserWebpackPlugin({
  // Use multi-process concurrent execution to improve build speed. Default number of concurrent executions: os.cpus().length - 1.
  parallel: true,
  ...
}),
```

### Enable webpack Cache
- Cache:
```js
module.exports = {
  cache: { type: 'filesystem' }, // Persistent cache
};
```

### Other Optimizations
- Dependency pre-building: Convert node_modules to ESM, speed up cold start.
- ESM on-demand loading: Browser native support, no bundling needed (Vite).
- Code Splitting: Dynamic import + SplitChunksPlugin.
- Tree Shaking: Remove unreferenced code (requires ES Module syntax).
- Extract external resources: Such as React/Vue framework packages, which basically don't change.

## Resource Loading Optimization
### HTTP/2 + GZIP/Brotli
- HTTP/2: Multiplexing, solves head-of-line blocking.
- Brotli/Gzip: Compress static resources (Nginx configuration example)

### CDN and Cache Strategy (Cache-Control, ETag)
- CDN: Distribute static resources, reduce RTT.
- Cache control:
```html
<meta http-equiv="Cache-Control" content="max-age=31536000">
```

### Reduce Resource Volume
In addition to GZIP compression above, resource volume can be reduced through the following methods:
- Split code through route-level and component-level lazy loading strategies.
- Tree Shaking, filter out unused code.
- Use tools like Uglify/terser to compress code.

If the project's main file is still too large after processing, use Webpack's splitChunks for splitting.
Also need to use tools like webpack-bundler-analyser to analyze bundled content, optimize various dependencies, and reduce unused content from being bundled.

### Reduce HTTP Requests
If possible, merge small files into one large file.
Some scattered configuration interfaces can also be merged into one.

### Resource Position Optimization
CSS files in the head, JavaScript files at the bottom

### Use Font Icons iconfont Instead of Image Icons
Font icons are icons made into fonts. When used, they work like fonts and can set properties such as font-size, color, etc., which is very convenient. Font icons are vector graphics and won't distort. Another advantage is that the generated files are particularly small.

### Preloading (Preload/Prefetch)
Preloading is a technique that improves user experience by loading resources in advance, reducing user waiting time and improving page response speed. Common preloading techniques include:
1. `<link rel="preload">` - Preload critical resources
2. `<link rel="prefetch">` - Load resources that may be needed in the future during idle time
3. `<link rel="preconnect">` - Pre-establish connections with third-party sources
4. `<link rel="dns-prefetch">` - Pre-perform DNS resolution
5. Image/data preloading - Preload images or data

## Runtime Optimization
### Debounce and Throttle
- Debounce: Trigger after continuous events end (e.g., search box).
- Throttle: Trigger at fixed intervals (e.g., scroll events).

Debounce code:
```js
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer); // Clear previous timer
    timer = setTimeout(() => {
      fn.apply(this, args); // Delayed execution
    }, delay);
  };
}

// Usage example
const searchInput = document.getElementById('search');
const handleSearch = () => console.log('Initiate search request');

searchInput.addEventListener('input', debounce(handleSearch, 500));
```

Throttle code:
```js
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

// Usage example
window.addEventListener('scroll', throttle(() => {
  console.log('Check if scrolled to bottom');
}, 200));
```

### Image Optimization
- Format selection: WebP (30% smaller than JPEG).
- Dynamic image cropping: Image processing provided by Alibaba Cloud and Qiniu, etc., can generate appropriately sized images by adding parameters.
  - Just dynamically add parameters to the image URL address to get the size you need, for example: http://7xkv1q.com1.z0.glb.clouddn.com/grape.jpg?imageView2/1/w/200/h/200
- Image lazy loading: Only display images when users browse to the corresponding area. The principle is: temporarily store the src value through HTML5 custom attributes data-xxx, then when the image appears in the screen visible area, reassign the data-xxx value to the img's src attribute.
- Use font icons instead of small icons:
  Font icons are the best choice for small icons on pages, the most commonly used is iconfont.
  Advantages of font icons:
  1) Lightweight: An icon font is smaller than a series of images. Once the font is loaded, icons render immediately, reducing HTTP requests
  2) Flexibility: Can freely change color, create shadows, transparency effects, rotation, etc.
  3) Compatibility: Supports almost all browsers, use with confidence
- Convert images to base64 format
  Convert small images to base64 encoded strings and write them into HTML or CSS to reduce HTTP requests.
  Pros and cons of base64 format:
  1) It often handles very small images, because after Base64 encoding, image size expands to 4/3 of the original file. If Base64 encoding is also used for large images, the latter's volume will significantly increase. Even if HTTP requests are reduced, it cannot compensate for the performance overhead brought by this huge volume, which is not worth it.
  2) When transmitting very small images, the file volume expansion brought by Base64 and the time overhead of browser parsing Base64 are negligible compared to the HTTP request overhead it saves, and only then can its performance advantages be truly reflected.

Projects can use url-loader to convert images to base64:
```js
// Install
npm install url-loader --save-dev
    
// Configuration
module.exports = {
  module: {
    rules: [{
        test: /.(png|jpg|gif)$/i,
        use: [{
            loader: 'url-loader',
            options: {
              // Convert images smaller than 10kb to base64
              limit: 1024 * 10
            }
        }]
     }]
  }
};
```

### Framework Optimization
Each framework provides its own optimization strategies. You need to understand the framework's rendering principles and master the performance optimization APIs provided by the framework to write more efficient code.

Taking React as an example, after understanding its rendering process, we find that the factors affecting performance are as follows:
- React precisely calculates DOM nodes that need to be updated based on props, state, context, and other data
- When component props, state, context change, component updates are triggered.
- After component updates, related data calculations and functions are re-executed.
- For list components, when keys don't change, elements won't re-render.

Therefore, we need to pay attention to the following during development:
- Distinguish between changing and unchanging parts of data, reasonably design data structures for props, state, etc.
- Use React.memo to cache components, don't update when related dependencies don't change.
- Use useMemo to cache calculated data, don't update when related dependencies don't change.
- Use useCallback to manage function execution, don't call again when related dependencies don't change.

React automatically merges multiple state update operations, but in React 17, functional component useState still triggers multiple times. If the version is lower, optimization needs to be noted.

**Long List Optimization**
In actual projects, we often encounter large data list display situations, such as 1000 pieces of data. If displayed as-is, at least 1000 DOM nodes will be generated, which will greatly increase the browser's rendering burden.
For users, they only care about the data in the display area. So we only need to display the data items in the user's current visible area.
The implementation principle is: combine the scrollbar top position and the container's visible area to calculate the data items in this interval and render them into the scroll container.

### Computing Optimization
#### Algorithm Optimization
For complex calculations, we need to do complexity analysis (Big O notation) to analyze code execution efficiency and memory usage.

For example: Code to find multiple pieces of data from an array, an inefficient code might look like this:
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
```

Each find needs to traverse once, complexity is O(n^2). Normally it should be completed in one loop, complexity is O(n):
```js
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
If a calculation causes page stuttering, consider using web worker optimization to move calculations to sub-threads. Common scenarios include image blur processing, canvas drawing. Here's image filter code:

Main thread logic (UI interaction):
```js
<!-- index.html -->
<input type="file" id="image-upload" accept="image/*" />
<button id="apply-filter">Apply Grayscale Filter</button>
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
      // Pass image data to Worker
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Send data to Worker
      worker.postMessage(imageData, [imageData.data.buffer]); // Transfer ownership, avoid copying
    };
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Receive Worker processing results
worker.onmessage = (e) => {
  const canvas = document.createElement('canvas');
  canvas.width = e.data.width;
  canvas.height = e.data.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(e.data, 0, 0);

  // Display processed image
  document.getElementById('preview').src = canvas.toDataURL();
};
```

Web Worker process:
```js
// image-worker.js
self.onmessage = (e) => {
  const imageData = e.data;
  const pixels = imageData.data;

  // Grayscale calculation (traverse all pixels)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b; // Grayscale formula
    pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
  }

  // Return processed data
  self.postMessage(imageData, [imageData.data.buffer]); // Transfer ownership
};
```

#### Time Slicing
For complex calculations that involve DOM operations and can be split, such as long list rendering scenarios, time slicing solutions are needed to split calculations into multiple tasks. For example, split the array list data to be calculated into 10 parts, then use requestIdleCallback or setTimeout to execute separately. This won't block the main process.

setTimeout example:
```js
function processLargeArray(array, chunkSize = 100, callback) {
  let index = 0;
  function processChunk() {
    const chunk = array.slice(index, index + chunkSize);
    chunk.forEach(item => callback(item));
    index += chunkSize;
    if (index < array.length) {
      setTimeout(processChunk, 0); // Put remaining tasks into next event loop
    }
  }
  processChunk();
}

// Usage example
processLargeArray(hugeArray, 100, (item) => {
  renderItem(item); // Render single data
});
```

requestIdleCallback example:
```js
function processTaskInIdleTime(tasks) {
  function runNextTask(deadline) {
    while (deadline.timeRemaining() > 0 && tasks.length > 0) {
      const task = tasks.shift();
      task(); // Execute single task
    }
    if (tasks.length > 0) {
      requestIdleCallback(runNextTask); // Continue processing remaining tasks
    }
  }
  requestIdleCallback(runNextTask);
}

// Usage example
const tasks = Array.from({ length: 1000 }, (_, i) => () => {
  console.log(`Processing task ${i}`);
});
processTaskInIdleTime(tasks);
```

Actually, React's reconciliation algorithm uses this solution, splitting rendering tasks and setting priorities, using requestIdleCallback to execute during idle time and allowing high-priority tasks to execute first.

#### Time Slicing + Web Worker Optimization
In actual applications, the above two solutions are often combined for optimization, such as large file chunked upload. After chunking, file Hash needs to be calculated to ensure correct files are received when the server receives and merges. File Hash calculation is a time-consuming task that needs to be handed over to Worker.

#### Parallel Computing
For multiple unrelated tasks that can be executed asynchronously, consider using Promise.all for pseudo-parallel optimization, such as multiple unrelated data requests. Of course, this is under the premise that TCP connection numbers allow.
```js
const tasks = [
  fetch('/api/data1'),
  fetch('/api/data2'),
  fetch('/api/data3'),
];

Promise.all(tasks).then((results) => {
  console.log(results); // Triggered after all requests complete
});
```

JavaScript main thread schedules asynchronous tasks through event loop, tasks themselves (such as network requests) are handled by browser underlying multi-threading, but callback logic still runs on main thread.

If true multi-threaded parallel solutions are needed, Web Worker should be used:
```js
// Main thread
const worker1 = new Worker('worker.js');
const worker2 = new Worker('worker.js');

worker1.postMessage(bigFile1);
worker2.postMessage(bigFile2);

// worker.js
self.onmessage = (e) => {
  const result = heavyCalculation(e.data); // Run in sub-thread
  self.postMessage(result);
};
```

### HTTP Cache Optimization
Browsers support caching files for HTTP requests, which can be combined with build file Hash names to cache files that haven't been updated.
For SPA applications, be careful not to cache index.html.

### Data Cache Optimization
To improve secondary access speed, accessed data will be cached. Data can be stored in memory variables or in browser local cache.
Note that regardless of caching method, space usage should be noted. We can use LRU algorithm to ensure data is within a reasonable range.

### Reduce Reflow and Repaint
Reflow: When changing DOM element position or size, it causes the browser to regenerate the render tree. This process is called reflow.
Repaint: After regenerating the render tree, each node of the render tree needs to be painted to the screen. This process is called repaint. Not all actions cause reflow. For example, changing font color only causes repaint. Remember, reflow causes repaint, repaint doesn't cause reflow.
Both reflow and repaint operations are very expensive because the JavaScript engine thread and GUI rendering thread are mutually exclusive, and only one can work at a time.

### Others
- When there are many judgment conditions: Use switch instead of if-else.
  - When neither is the best choice, such as too many, use lookup tables, which can be built using arrays or objects.
- Use flexbox instead of earlier layout models like tables.

## Interaction Optimization
### White Screen Optimization
Reducing white screen requires using various optimization strategies mentioned above, especially paying attention to:
- Reduce bundle size, load non-essential resources on demand.
- Use SSR framework.
- Virtualized display.
- Add skeleton screens.

### Loading Process Indication
Add progress bars or transition animations

### Responsive Images
Intelligently load the most suitable image resources based on device screen size, resolution, and network conditions, thereby reducing unnecessary bandwidth consumption while ensuring visual effects.

Implementation methods include:

#### srcset+sizes
```html
<img src="default.jpg"  <!-- Fallback image -->
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 800px"
  alt="Responsive image"
>
```

#### picture Element
```html
<picture>
  <!-- Narrow screen: Portrait crop -->
  <source media="(max-width: 600px)" srcset="portrait.webp" type="image/webp">
  <source media="(max-width: 600px)" srcset="portrait.jpg" type="image/jpeg">

  <!-- Wide screen: Landscape original -->
  <source srcset="landscape.webp" type="image/webp">
  <source srcset="landscape.jpg" type="image/jpeg">

  <!-- Fallback (browsers that don't support picture) -->
  <img src="landscape.jpg" alt="Responsive image">
</picture>
```

#### CSS Media Query + Background Image
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

There's also implementation through JS, which is not recommended as it causes repaint and reflow.

### Skeleton Screen
- Placeholder preview, reduce layout shift (CLS).

### Animation Optimization (CSS Animation, GPU Acceleration)
- Use transform and opacity (triggers GPU acceleration).
- Avoid frequent reflow (like modifying width).

### Error Boundaries and Degradation Handling
The goal here is to optimize error prompts. You can use try...catch, or like React's componentDidCatch to catch component errors, and display fallback content when errors occur.

### Prevent Duplicate Submission (Button Disable, Request Interception)
Button disable + request interception:
```js
const [loading, setLoading] = useState(false);
const handleSubmit = () => {
  if (loading) return;
  setLoading(true);
  // Initiate request...
};
```

## Related Tools
- Detection: Lighthouse, WebPageTest.
- Monitoring: Sentry, Performance API.

## Summary
The above content is my daily optimization checklist. In the actual implementation process, it should be carried out in combination with the actual situation of the project, time, and team situation. Avoid over-optimization.
