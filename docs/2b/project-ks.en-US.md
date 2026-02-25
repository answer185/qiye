---
toc: content
group: 
  title: Project Experience
  order: 1
order: 2
---
# Empty-Handed Sourcing

## Project Background
This is software developed for major e-commerce platforms, mainly targeting e-commerce enterprises. Its main function is product sourcing, i.e., synchronizing product data from various supply websites such as 1688, Pinduoduo, etc., to stores.

It can also manage products and orders for various stores. Users can centrally manage multiple stores in one backend.

The project was established in 2020, using the following tech stack:
- Project created using create-react-app
- React version 16.X, without TypeScript
- Routing: React-router
- State management: Redux
- UI component library: Ant-design

Project development mainly focused on functionality implementation and rapid launch. From project setup to subsequent technical iterations, everything was rushed, leaving many technical debts.

## Project Issues
- Slow build speed
- Large bundled files
- Chaotic code organization
- User operation lag
- Long white screen time

## Performance Optimization
### Code Splitting and Lazy Loading Optimization
#### Route Page-Level Code Splitting
The current project didn't split files for each route page, resulting in a very large index.js. So first, we split page code.

Optimized based on React.lazy and Suspense components:
```js
// Implement route lazy loading using React.lazy and Suspense
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
      </Switch>
    </Suspense>
  </Router>
);
```

#### Large Modal Component Code Splitting
For several large modal components, such as price and inventory configuration during sourcing, we performed code splitting. To avoid re-requesting every time clicked, we added markers.
```js
import React, { useState, Suspense, lazy, useRef } from 'react';

// Defined outside component to avoid repeated creation
const LargeModal = lazy(() => import('./LargeModal'));

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasLoadedRef = useRef(false); // Mark whether already loaded

  const handleOpen = () => {
    hasLoadedRef.current = true; // Mark as loaded
    setIsModalOpen(true);
  };

  return (
    <div>
      <button onClick={handleOpen}>Open Modal</button>
      
      {/* Only render Suspense when marked as loaded or needs to display */}
      {(hasLoadedRef.current || isModalOpen) && (
        <Suspense fallback={<div>Loading...</div>}>
          {isModalOpen && (
            <LargeModal onClose={() => setIsModalOpen(false)} />
          )}
        </Suspense>
      )}
    </div>
  );
}
```

#### Ant Design On-Demand Loading Configuration
Implemented based on babel-plugin-import
```js
// .babelrc or babel.config.js
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": "css" // or true if using less
    }]
  ]
}
```

#### moment and lodash Optimization
Remove unnecessary language packages from moment
```js
// Add in webpack configuration
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};

// Then manually import specific language packages where needed
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
```

lodash on-demand loading: modify import method
```js
// Replace this import method
import _ from 'lodash';

// Use this on-demand import method
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
```

### Webpack Optimization Configuration
Use react-app-rewired to optimize webpack.
```sh
npm install react-app-rewired --save-dev
```
After installation, create config-overrides.js. Main optimization points considered:
- Webpack caching: Use filesystem cache for development environment startup
- Module resolution optimization: Specify module lookup directories and configure alias, gradually replace relative path module imports
- Babel compilation optimization: Set compilation scope and enable caching
- Multi-process compression: Enable multi-process for TerserPlugin
- Enable Tree Shaking: Remove unused code and console debug code
- splitChunks strategy optimization:
  - minsize: 30KB: Files smaller than 30KB splitting would increase request overhead (TCP slow start impact)
  - maxSize: 244KB (HTTP/2's default TCP window size for efficient transmission of maximum packet size)
  - minChunks set to 2: Only modules shared by multiple chunks are worth splitting (avoid unnecessary splitting of single-page used modules)

Related optimization configuration:
```js
const path = require('path');
const { override, addWebpackPlugin, adjustWorkbox } = require('customize-cra');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

// Judge environment variables
const isProd = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE === 'true';

module.exports = override(
  // 1. Enable Webpack persistent caching (development environment)
  (config) => {
    if (!isProd) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    return config;
  },

  // 2. Configure module lookup scope
  (config) => {
    config.resolve = {
      ...config.resolve,
      modules: [
        path.resolve(__dirname, 'src'),
        'node_modules',
      ],
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    };
    return config;
  },

  // 3. Optimize babel-loader compilation scope
  (config) => {
    const babelLoader = config.module.rules.find(rule => 
      rule.oneOf && 
      rule.oneOf.some(r => r.loader && r.loader.includes('babel-loader'))
    );

    if (babelLoader) {
      babelLoader.oneOf.forEach(rule => {
        if (rule.loader && rule.loader.includes('babel-loader')) {
          rule.include = [
            path.resolve(__dirname, 'src'),
            // Add other directories that need compilation
          ];
          rule.exclude = /node_modules\/(?!(antd|rc-|@antd|your-other-modules)\/)/;
          rule.options.cacheDirectory = true; // Enable caching
          rule.options.cacheCompression = false; // Disable compression (improve speed)
        }
      });
    }
    return config;
  },

  // 4. Production environment optimization configuration
  (config) => {
    if (isProd) {
      // Enable multi-process compression
      config.optimization.minimizer = [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              warnings: false,
              drop_console: true,
              pure_funcs: ['console.log']
            },
            output: {
              comments: false
            }
          },
          extractComments: false
        })
      ];

      // Force enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;

      // Chunk splitting strategy
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244 * 1024, // 244KB
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      };
    }
    return config;
  },

  // 5. Add plugins
  addWebpackPlugin(new HardSourceWebpackPlugin()), // Compilation cache
  isAnalyze && addWebpackPlugin(new BundleAnalyzerPlugin()), // Bundle analysis

  // 6. PWA optimization (optional)
  adjustWorkbox(wb => 
    Object.assign(wb, {
      skipWaiting: true,
      exclude: (wb.exclude || []).concat(/\.map$/)
    })
  )
);
```

### Resource Loading Optimization
- Merge configuration request interfaces, unified through config, support multiple parameters
- nginx server enable HTTP/2, Gzip level 6
```conf
server {
    listen 443 ssl http2;  # Key point: add http2 identifier
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    # Other configurations...
}
```

### Optimization Results
The project has over 200 components, making it a medium-sized project.
- Startup time reduced from about 1 minute to about 15s
- Original main file about 2.7M, after optimization, about 500K
- Total size reduced by about 57%
- Loading time reduced from about 6s to about 2.5s

## Project Iteration
### Project Splitting
Split project by module functionality into the following sub-projects:
- Login
- Collection module
- Sourcing module
- Tracking
Original system retains store management, order management, after-sales, and statistics functions

New projects developed using Nextjs + shadcn/ui + tailwindcss

### Tracking
Record user behavior:
- Determine page and button KEYs
- Report after user operations

### Data Statistics
- Store dimension
- Product dimension

### Other Business Modules
- Improve various functions based on user feedback.
