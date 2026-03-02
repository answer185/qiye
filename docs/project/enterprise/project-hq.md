---
toc: content
group: 
  title: 项目经验
  order: 1
order: 5
---
# 红圈营销
## 项目背景
红圈营销是针对泛快消行业的客户管理与销售协同管理的SaaS产品。核心的业务场景是：企业需要派遣销售人员上门，去各客户的终端门店等了解产品销售情况，并上报货架图片、销售情况、订单、退单及销售人员的定位等数据。

其主要功能有：
- 客户管理
- 商品管理
- 订退单管理
- 市场活动管理
- 销售人员轨迹、拜访定位管理
- 考勤、审批、日志、沟通、公告等OA功能
- 目标管理及达成情况分析
- 数据报表
等。

涉及的终端有：
- Web端
- 手机端（IOS和安卓）
- 小程序端：主要用于订货

## 技术选型
这里主要针对Web端进行说明，手机端主要是IOS和安卓团队负责，对于交互复杂的部分，使用H5开发，占的内容不多。
项目立项是2017年，我们选择了以React为基础来构建整个项目，做此选择的主要原因是：
- Vue当时还是1.X，生态没有React大。
- AngularJS是基于MVC的框架，从技术实现上来说，React的虚拟DOM、组件化及JSX和单身数据流等概念明显更超前。
- 阿里的Ant-design组件、dva的数据流管理、atool-build的webpack封装，使开发Web应用更加高效。
- React的生态发展也很迅速。

基于此，我们选择了React来搭建项目。

## 前端工程
### 代码规范
- ESLint + Airbnb规范
- Stylelint + standard规范
- Prettier代码格式化
- 增加相应的lint和修复命令

### 构建系统
基于atool-build实现，这是阿里的webpack构建工具，后面演进成roadhog。现在应该整合到umi的构建体系中。
我们在此基础上，增加了：
- 多环境的编译支持，主要环境有4个：开发环境、测试环境、预发布环境、生产环境
- 使用dora作为本地开发服务器，并与webpack集成，以支持HMR，反向代理等特性。
- 增加相关的插件：
  - html-webpack-plugin： 生成 HTML 入口文件，自动注入 JS/CSS
  - extract-text-webpack-plugin： 将 CSS 提取为独立文件（而非 JS 内联）
  - clean-webpack-plugin： 构建前清理 dist 目录
  - webpack-parallel-uglify-plugin： 多进程并行压缩 JS

### 调试增强
- redbox-react： 增强 React 错误提示（红屏）
- redux-logger: 显示redux的状态变化

### 测试体系
- 基于Jest书写测试代码
- 基于Enzyme(v3) + react-test-renderer进行组件测试

### Mock服务
基于dora-plugin-proxy实现，通过配置proxy.config.js实现/api/*请求的转发。
对应的mock数据目录是mocks。针对每个api，书写返回的数据。


## 前端架构
该项目是Web端类型的SaaS项目，主要运行在Chrome浏览器环境。因为不需要SEO，所以架构模块选择SPA。技术栈主要基于React。

### 核心架构
- 路由：基于react-router实现
- 状态管理：以dva.js作为基础，使用Reselect和Immutable.js对状态管理进行优化。
- 组件库：用Ant Design作为主要的UI组件库，再从react生态中挑选合适的组件，如：
  - react-color（颜色选择器）
  - react-slick(轮播)
  - react-grid-layout(网格布局)
  - react-dnd(拖拽组件)
- 数据处理：
  - 时间：moment
  - cookie处理： js-cookie
  - 各类型数据处理：lodash

### 可视化
- 报表：基于Highcharts及react-highcharts实现。
  - 未选择ECharts是因为公司有购买Highcharts的授权且之前的其他项目也在使用。

### css模块化方案
基于less作为css的模块化方案，与antd-design保持一致。

### 其他细节设计
- 富文本编辑器：react-quill
- 拖拽方案：react-dnd
- URL参数序列化：qs
- PDF预览：react-pdf
- 图片处理：
  - react-images：图片画廊
  - react-avatar-editor(头像裁剪)
  - react-image-crop:(图片裁剪)
- 加密：md5
- 条形码生成：jsbarcode
- 二维码生成：qrcode
- 中文数字转化：nzh
- 汉字转拼音：pinyin
- 数字转中文大写：nzh

## 技术演进
### 自动化部署
基于jenkins自动部署，这工作主要是运维，前端配置增加了build:jenkins的命令。

### git开发规范
- 开发时以feature-版本-开发人员为分支名称
- bug解决以bugfix-bug号-开发人员为分支名称
- 测试环境代码分支：开发完成后，要提测，先合并到该分支。合并不需要审核。
- 预发环境分支：整个版本开发完成后，先发预发环境，并对接线上的数据库。该合并需要审核。
- 线上分支：预发环境测试通过后，发布到线上，该合并需要审核。
git commit需要用简短的语句说明修改内容。

### 版本锁定
随着各依赖的演进，出现不向下兼容的情况，所以锁定各依赖的版本。

### 代码片断
基于vscode的代码片断功能，提供基础的代码模块，方便快速开发。

### 埋点方案
该系统的埋点方案，主要是通过后端网关自动埋点，前端只在一些特殊的操作提交数据。根据产品经理设置的Key及需要的数据上报。

### 技术栈升级
随着前端技术的发展，之前的技术选型已经过旧，又因为业务逻辑复杂，导致升级困难，我们尝试过以下方案：
- 书写迁移工具，使通过匹配、自动修改等方案，处理不适合新版本的React及Antd的代码。
  - 该方案未落地，因为迁移后，整个项目非常不稳定。
- 逐步迁移模块到新项目环境中
  - 使用新的技术栈搭建相同外观的页面，并使用新域名部署。
  - 逐步重构各模块到该环境中。
  - 拆分一些比较独立的模块到独立的项目中，并单独部署，如登录模块，系统设置模块
  - 不足：维护成本比较高，拆分不合理时，可能需要两个项目开发。
- 微前端方案
  - 基于qiankun隔离各个系统。
  - 不足：改造难度高，各种冲突严重。

### 性能优化
#### 图片优化
用户上报时，会上传大量的图片，但是因为现在手机像素都很高，有些图片的大小甚至会10多M，导致上传速度变慢，且耗费很多流量。我们的优化方案是：
- 使用compressorjs进行压缩，虽然会有一定的性能损耗，但是可以大量减少文件大小。
- 压缩后上传，总的上传时间了也节约了50%左右。
- 图片上传到阿里云的OSS
- 图片展示时，根据实际的展示位置的大小组合合适的图片url

实际使用中，还需要根据用户的手机性能、网络情况做下调整，如果手机像素不高，则直接上传。主要根据图片的尺寸、文件大小来判断。如果移动信号不好，导致图片上传失败，需要在将数据添加到localstorage中，在网络没问题时，可以重新上传。

#### 启动和构建优化
随着项目迭代的进行，项目的组件越来越多，导致项目在启动和构建时，需要花费大量的时间。主要的优化策略如下：
- 增加webpack-parallel-uglify-plugin插件，进行多进程压缩。
- 代码分割：
  - 路由级的代码分割：基于getComponent属性和require.ensure实现
  ```js
  <Route
    path="/tclogin/:id(/:hqt/:crm)"
    getComponent={(location, cb) => {
      require.ensure([], require => {
        cb(null, require('./routes/login/TcLogin')); // 加载完成后回调
      });
    }}
  />
  ```
  - 基于 react-lazyload 实现大组件的分离。
  ```js
  import LazyLoad from 'react-lazyload';
  {allowModuleApproval() && (
    <LazyLoad height={500}>
      <Approve
        dispatch={this.props.dispatch}
        approveId={this.props.contractDetail.detail.approveId}
        approveDetail={this.props.contractDetail.approveDetail}
        organization={this.props.organization}
        auth={this.props.auth}
      />
    </LazyLoad>
  )}
  ```
- 去掉不用的代码
  - 因为该版本的webpack不支持treeShaking的特性，所以通过eslint来检查手动去掉。
- css抽离与压缩，基于extract-text-webpack-plugin实现
- chunks拆分：
  - 基于webpack.optimize.CommonsChunkPlugin实现
  - 主要抽离node_modules下的依赖，放置到vendor.js里。

#### 状态管理优化
业务数据很复杂，比如模板配置之类的数据对象属性很多，且层级比较深，如果修改可能导致大量组件刷新。所以引入：
- reselect: 对一些计算属性进行缓存。
- 引入Immutable.js，支持不可变数据。

#### 静态资源优化
- 静态资源走阿里云CDN
- 服务器开启GZIP，压缩等级为6
- 使用iconfont代替图片图标

#### HTTP请求优化
随着项目业务逻辑的复杂，页面的内容会涉及到很多的业务接口。比如客户详情页面，会涉及到客户的几乎所有数据，比如：订单、拜访记录，负责人变迁等。
因为后端有查询性能问题，导致接口没法合并。所以需要前端做下优化，具体的方案如下：
- 将各业务组件的数据请求统一放到页面组件层，通过redux共享组件数据。
- 首屏加载客户基本信息的数据，页面也先展示客户基本信息。在该接口请求完成后，才展示业务数据。
- 对业务数据的请求进行分层，然后逐层请求。
  - 因为产品拒绝在交互上改进，比如先折叠数据，当用户点击后再显示。所以数据必须在用户点开页面后逐步加载完成。

#### 虚拟化显示
再以客户详情页面为例，因为业务的复杂度很高，导致页面很长，数据问题解决后，还会有渲染卡顿的问题，通过react-virtualized进行虚拟化。
因为这个页面不是普通的列表，而是由各种业务组件组成，所以需要使用CellMeasurer组件来对各业务模块进行转化。类似的实现逻辑如下：
```js
import React, { useRef, useState } from 'react';
import { List, CellMeasurer, CellMeasurerCache, AutoSizer } from 'react-virtualized';
import CustomerInfo from './CustomerInfo';
import VisitList from './VisitList';
import OrderList from './OrderList';
import UsersList from './UsersList';
import ReturnedOrderList from './ReturnedOrderList';

// 定义页面组件类型和顺序
const PAGE_SECTIONS = [
  { type: 'CUSTOMER_INFO', component: CustomerInfo, defaultHeight: 300 },
  { type: 'VISIT_LIST', component: VisitList, defaultHeight: 400 },
  { type: 'ORDER_LIST', component: OrderList, defaultHeight: 500 },
  { type: 'USERS_LIST', component: UsersList, defaultHeight: 200 },
  { type: 'RETURNED_ORDERS', component: ReturnedOrderList, defaultHeight: 300 }
];

const CustomerDetailPage = ({ customerId }) => {
  // 创建高度测量缓存
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 150
    })
  );

  // 页面数据状态
  const [data, setData] = useState({
    customer: null,
    visits: [],
    orders: [],
    users: [],
    returnedOrders: []
  });

  // 行渲染器
  const rowRenderer = ({ index, key, parent, style }) => {
    const section = PAGE_SECTIONS[index];
    const Component = section.component;

    return (
      <CellMeasurer
        key={key}
        cache={cache.current}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        {({ measure }) => (
          <div style={style} className="page-section">
            <div onLoad={measure}>
              {index === 0 && <CustomerInfo data={data.customer} onLoad={measure} />}
              {index === 1 && <VisitList visits={data.visits} onLoad={measure} />}
              {index === 2 && <OrderList orders={data.orders} onLoad={measure} />}
              {index === 3 && <UsersList users={data.users} onLoad={measure} />}
              {index === 4 && <ReturnedOrderList orders={data.returnedOrders} onLoad={measure} />}
            </div>
          </div>
        )}
      </CellMeasurer>
    );
  };

  return (
    <div className="customer-detail-container">
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            deferredMeasurementCache={cache.current}
            rowHeight={cache.current.rowHeight}
            rowRenderer={rowRenderer}
            rowCount={PAGE_SECTIONS.length}
            overscanRowCount={2}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default CustomerDetailPage;
```

#### 白屏优化
增加骨架屏显示，避免白屏时间过长。

#### 其他卡顿优化
主要通过测试团队或用户反馈来发现卡顿的点，并做相应的调查和解决，常见的方案如下：
- 防抖和节流优化，避免频繁触发某个操作。
- 按钮的增加loading效果，避免数据重复提交。
- 弹窗速度优化，先弹窗再做其他相关的处理，避免点击后无反应现象。
- 因为该版本没有Fiber的渲染调解算法，涉及到canvas，复杂数据计算需要手动优化：
  - 对于一些如图片处理和canvas绘制的内容，转到web worker里
  - 对一些大对象的数据，如模板配置数据，解析成更符合前端组件需要的格式。并使用reselect进行缓存。
- 长列表页面优化，比如用户的操作日志，老客户的拜访记录等记录
  - 使用react-virtualized进行虚拟化展示。
  - 增加加载更多的按钮，进行滚动分页，避免数据一次加载。

