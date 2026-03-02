---
toc: content
group: 
  title: 项目经验
  order: 1
order: 2
---
# 空手上货
## 项目背景
这是针对各大电商平台开发的软件，主要针对电商企业。其主要功能为铺货。即从各货源网站，如1688，拼多多等，同步商品数据到店铺，

同时还可以对各店铺的商品，订单进行管理。用户可以在一个后台集中管理多个店铺。

项目立项是2020年，使用的技术栈是：
- 使用 create-react-app 创建的项目
- React版本是16.X，未使用Typescript
- 路由：React-router
- 状态管理：Redux
- UI组件库：Ant-design
项目开发主要以功能实现及快速上线为主，从项目的搭建开始到后续的技术迭代都很匆忙，留下了很多的技术债务。

## 项目问题
- 构建速度慢
- 打包后的文件过大
- 代码组织混乱
- 用户操作时会有卡顿
- 白屏时间过长

## 性能优化
### 代码分割与懒加载优化
#### 路由页面级代码分割
当前项目并没有对各路由页面的文件进行拆分，导致index.js很大。所以首先对页面的代码进行分割。

基于React.lazy及Suspense组件优化,如：
```js
// 使用React.lazy和Suspense实现路由懒加载
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

#### 大弹窗组件代码分割
对于几个大弹窗组件，铺货时的价格、库存等配置等。进行代码分割。同时为了避免每次点击都重新请求，增加了标记。
```js
import React, { useState, Suspense, lazy, useRef } from 'react';

// 在组件外部定义，避免重复创建
const LargeModal = lazy(() => import('./LargeModal'));

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasLoadedRef = useRef(false); // 用来标记是否已加载过

  const handleOpen = () => {
    hasLoadedRef.current = true; // 标记为已加载
    setIsModalOpen(true);
  };

  return (
    <div>
      <button onClick={handleOpen}>打开弹窗</button>
      
      {/* 只有标记为已加载或需要显示时才渲染Suspense */}
      {(hasLoadedRef.current || isModalOpen) && (
        <Suspense fallback={<div>加载中...</div>}>
          {isModalOpen && (
            <LargeModal onClose={() => setIsModalOpen(false)} />
          )}
        </Suspense>
      )}
    </div>
  );
}
```

#### Ant Design的按需加载配置
基于babel-plugin-import实现
```js
// .babelrc 或 babel.config.js
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": "css" // 或者 true 如果你使用less
    }]
  ]
}
```

#### moment和lodash优化
moment去掉不必要的语言包
```js
// 在webpack配置中添加
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
};

// 然后在你需要的地方手动引入特定语言包
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
```

lodash按需加载：修改导入的方式
```js
// 替换这种导入方式
import _ from 'lodash';

// 使用这种按需导入方式
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
```

### Webpack优化配置
使用react-app-rewired来优化webpack。
```sh
npm install react-app-rewired --save-dev
```
安装后，创建config-overrides.js。主要考虑的优化点有：
- Webpack缓存：开发环境使用filesystem缓存加载启动
- 模块解析优化：指定模块查找目录及配置alias别外，逐步替换掉相对路径的模块导入。
- Babel编译优化：设置编译范围并开启缓存。
- 多进程压缩：针对TerserPlugin开启多进程。
- 开启Tree Shaking： 去掉不用的代码及console调试代码
- splitChunks策略优化：
  - minsize为：30KB: 小于30KB的文件拆分反而会增加请求开销（TCP慢启动影响）
  - maxSize为244KB(HTTP/2的默认TCP窗口大小能高效传输的最大包大小)
  - minChunks设置为2：被多个chunk共享的模块才值得拆分（避免单页面使用的模块被不必要拆分）

相关的优化配置如下：
```js
const path = require('path');
const { override, addWebpackPlugin, adjustWorkbox } = require('customize-cra');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

// 判断环境变量
const isProd = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE === 'true';

module.exports = override(
  // 1. 开启Webpack持久化缓存（开发环境）
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

  // 2. 配置模块查找范围
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

  // 3. 优化babel-loader编译范围
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
            // 添加需要编译的其他目录
          ];
          rule.exclude = /node_modules\/(?!(antd|rc-|@antd|your-other-modules)\/)/;
          rule.options.cacheDirectory = true; // 启用缓存
          rule.options.cacheCompression = false; // 禁用压缩（提升速度）
        }
      });
    }
    return config;
  },

  // 4. 生产环境优化配置
  (config) => {
    if (isProd) {
      // 启用多进程压缩
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

      // 强制开启tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;

      // 分包策略
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

  // 5. 添加插件
  addWebpackPlugin(new HardSourceWebpackPlugin()), // 编译缓存
  isAnalyze && addWebpackPlugin(new BundleAnalyzerPlugin()), // 包分析

  // 6. PWA优化（可选）
  adjustWorkbox(wb => 
    Object.assign(wb, {
      skipWaiting: true,
      exclude: (wb.exclude || []).concat(/\.map$/)
    })
  )
);
```

### 资源加载优化
- 合并配置请求接口，统一走config,支持多个参数。
- nginx服务器开启HTTP/2，Gzip等级6
```conf
server {
    listen 443 ssl http2;  # 关键点：添加http2标识
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    # 其他配置...
}
```

### 优化成果
项目中有组件200多个，算是中型项目。
- 启动时间从原先的1分钟左右到15s左右
- 原主文件2.7M左右，优化后，500多K
- 总大小缩减57%左右
- 加载时间从6s左右到2.5s左右

## 项目迭代
### 项目拆分
按模块功能进行项目拆分，分为以下子项目
- 登录
- 采集模块
- 铺货模块
- 埋点
原系统保留店铺管理、订单管理、售后及统计等功能

新项目使用Nextjs+shadcn/ui+tailwindcss开发

### 埋点
记录用户的行为：
- 确定页面及按钮的KEY
- 用户操作后上报

### 数据统计
- 有店铺维度
- 有商品维度

### 其他业务模块
- 根据用户反馈，改进各个功能。