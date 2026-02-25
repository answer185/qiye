---
toc: content
group: 
  title: Project Experience
  order: 1
order: 5
---
# Hongquan Marketing

## Project Background
Hongquan Marketing is a SaaS product for customer management and sales collaboration management in the fast-moving consumer goods industry. The core business scenario is: enterprises need to dispatch sales personnel to visit various customer terminal stores to understand product sales situations and report shelf images, sales situations, orders, returns, and sales personnel location data.

Its main functions include:
- Customer management
- Product management
- Order and return management
- Marketing activity management
- Sales personnel tracking and visit location management
- OA functions such as attendance, approval, logs, communication, and announcements
- Target management and achievement analysis
- Data reports
- etc.

Involved terminals include:
- Web end
- Mobile end (iOS and Android)
- Mini-program end: mainly for ordering

## Technology Selection
This mainly focuses on the Web end. The mobile end is mainly handled by iOS and Android teams. For complex interaction parts, H5 development is used, which doesn't account for much content.
The project was established in 2017, and we chose to build the entire project based on React. The main reasons for this choice were:
- Vue was still version 1.X at the time, with a smaller ecosystem than React
- AngularJS was an MVC-based framework. From a technical implementation perspective, React's virtual DOM, componentization, JSX, and unidirectional data flow concepts were clearly more advanced
- Alibaba's Ant Design components, dva's data flow management, and atool-build's webpack encapsulation made Web application development more efficient
- React's ecosystem was also developing rapidly

Based on this, we chose React to build the project.

## Frontend Engineering
### Code Standards
- ESLint + Airbnb standards
- Stylelint + standard standards
- Prettier code formatting
- Added corresponding lint and fix commands

### Build System
Implemented based on atool-build, which is Alibaba's webpack build tool, later evolved into roadhog. Now it should be integrated into umi's build system.
On this basis, we added:
- Multi-environment compilation support, mainly 4 environments: development, testing, pre-release, and production
- Used dora as local development server, integrated with webpack to support HMR, reverse proxy, and other features
- Added related plugins:
  - html-webpack-plugin: Generate HTML entry files, automatically inject JS/CSS
  - extract-text-webpack-plugin: Extract CSS as independent files (rather than JS inline)
  - clean-webpack-plugin: Clean dist directory before build
  - webpack-parallel-uglify-plugin: Multi-process parallel JS compression

### Debug Enhancement
- redbox-react: Enhanced React error prompts (red screen)
- redux-logger: Display redux state changes

### Testing System
- Write test code based on Jest
- Component testing based on Enzyme (v3) + react-test-renderer

### Mock Service
Implemented based on dora-plugin-proxy, through configuring proxy.config.js to implement /api/* request forwarding.
The corresponding mock data directory is mocks. For each API, write the returned data.

## Frontend Architecture
This project is a Web-end SaaS project, mainly running in Chrome browser environment. Since SEO is not needed, the architecture module chose SPA. The tech stack is mainly based on React.

### Core Architecture
- Routing: Implemented based on react-router
- State management: Using dva.js as foundation, optimized state management with Reselect and Immutable.js
- Component library: Using Ant Design as main UI component library, then selecting suitable components from React ecosystem, such as:
  - react-color (color picker)
  - react-slick (carousel)
  - react-grid-layout (grid layout)
  - react-dnd (drag and drop components)
- Data processing:
  - Time: moment
  - Cookie handling: js-cookie
  - Various data processing: lodash

### Visualization
- Reports: Implemented based on Highcharts and react-highcharts
  - Did not choose ECharts because the company had purchased Highcharts license and other previous projects were also using it

### CSS Modularization Solution
Based on less as CSS modularization solution, consistent with antd-design.

### Other Detail Designs
- Rich text editor: react-quill
- Drag and drop solution: react-dnd
- URL parameter serialization: qs
- PDF preview: react-pdf
- Image processing:
  - react-images: image gallery
  - react-avatar-editor (avatar cropping)
  - react-image-crop: (image cropping)
- Encryption: md5
- Barcode generation: jsbarcode
- QR code generation: qrcode
- Chinese number conversion: nzh
- Chinese to pinyin: pinyin
- Number to Chinese uppercase: nzh

## Technical Evolution
### Automated Deployment
Based on Jenkins automated deployment, this work is mainly operations. Frontend configuration added build:jenkins command.

### Git Development Standards
- Development uses feature-version-developer as branch name
- Bug fixes use bugfix-bug number-developer as branch name
- Test environment code branch: After development completion, for testing, first merge to this branch. Merge doesn't require review
- Pre-release environment branch: After entire version development completion, first release to pre-release environment, and connect to online database. This merge requires review
- Online branch: After pre-release environment testing passes, release to online. This merge requires review
- Git commit needs brief statement explaining modification content

### Version Locking
As various dependencies evolved, non-backward compatible situations occurred, so locked versions of all dependencies.

### Code Snippets
Based on VSCode's code snippet functionality, providing basic code modules for convenient rapid development.

### Tracking Solution
The system's tracking solution mainly uses backend gateway automatic tracking, with frontend only submitting data for some special operations. Report based on product manager's set keys and required data.

### Tech Stack Upgrade
As frontend technology developed, previous technology choices became outdated, and due to complex business logic, upgrades became difficult. We tried the following solutions:
- Write migration tools to handle code unsuitable for new React and Antd versions through matching and automatic modification
  - This solution was not implemented because after migration, the entire project was very unstable
- Gradually migrate modules to new project environment
  - Use new tech stack to build pages with same appearance and deploy with new domain
  - Gradually refactor each module to this environment
  - Split some relatively independent modules into independent projects and deploy separately, such as login module, system settings module
  - Shortcoming: High maintenance cost, when splitting is unreasonable, may need two project development
- Micro-frontend solution
  - Based on qiankun to isolate various systems
  - Shortcoming: High transformation difficulty, various conflicts serious

### Performance Optimization
#### Image Optimization
When users report, they upload large amounts of images, but because current phone pixels are very high, some images can be over 10MB, causing slow upload speeds and consuming much traffic. Our optimization solution:
- Use compressorjs for compression, though there's some performance cost, can greatly reduce file size
- After compression upload, total upload time saved about 50%
- Images uploaded to Alibaba Cloud OSS
- When displaying images, combine appropriate image URLs based on actual display position size

In actual use, adjustments need to be made based on user's phone performance and network conditions. If phone pixels are not high, upload directly. Mainly judge based on image dimensions and file size. If mobile signal is poor, causing image upload failure, need to add data to localStorage, and re-upload when network is fine.

#### Startup and Build Optimization
As project iteration progressed, project components increased, causing project startup and build to take much time. Main optimization strategies:
- Add webpack-parallel-uglify-plugin for multi-process compression
- Code splitting:
  - Route-level code splitting: Implemented based on getComponent property and require.ensure
  ```js
  <Route
    path="/tclogin/:id(/:hqt/:crm)"
    getComponent={(location, cb) => {
      require.ensure([], require => {
        cb(null, require('./routes/login/TcLogin')); // Callback after loading completion
      });
    }}
  />
  ```
  - Large component separation based on react-lazyload
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
- Remove unused code
  - Because this webpack version didn't support treeShaking, manually removed through eslint checking
- CSS extraction and compression, implemented based on extract-text-webpack-plugin
- Chunk splitting:
  - Implemented based on webpack.optimize.CommonsChunkPlugin
  - Mainly extract dependencies under node_modules, place in vendor.js

#### State Management Optimization
Business data is very complex, such as template configuration data objects with many properties and deep levels. If modified, may cause many component refreshes. So introduced:
- reselect: Cache some computed properties
- Introduced Immutable.js, support immutable data

#### Static Resource Optimization
- Static resources use Alibaba Cloud CDN
- Server enables GZIP, compression level 6
- Use iconfont instead of image icons

#### HTTP Request Optimization
As project business logic became complex, page content involved many business interfaces. For example, customer detail page involves almost all customer data, such as: orders, visit records, responsible person changes, etc.
Because backend has query performance issues, interfaces couldn't be merged. So frontend needed optimization, specific solution:
- Put each business component's data requests uniformly at page component level, share component data through redux
- First screen loads customer basic information data, page also displays customer basic information first. After this interface request completes, display business data
- Layer business data requests, then request layer by layer
  - Because product refused interaction improvements, such as folding data first, displaying when user clicks. So data must be gradually loaded after user opens page

#### Virtualized Display
Taking customer detail page as example, because business complexity is very high, page becomes very long. After data issues resolved, there were still rendering lag issues, virtualized through react-virtualized.
Because this page isn't a normal list, but composed of various business components, need to use CellMeasurer component to transform each business module. Similar implementation logic:
```js
import React, { useRef, useState } from 'react';
import { List, CellMeasurer, CellMeasurerCache, AutoSizer } from 'react-virtualized';
import CustomerInfo from './CustomerInfo';
import VisitList from './VisitList';
import OrderList from './OrderList';
import UsersList from './UsersList';
import ReturnedOrderList from './ReturnedOrderList';

// Define page component types and order
const PAGE_SECTIONS = [
  { type: 'CUSTOMER_INFO', component: CustomerInfo, defaultHeight: 300 },
  { type: 'VISIT_LIST', component: VisitList, defaultHeight: 400 },
  { type: 'ORDER_LIST', component: OrderList, defaultHeight: 500 },
  { type: 'USERS_LIST', component: UsersList, defaultHeight: 200 },
  { type: 'RETURNED_ORDERS', component: ReturnedOrderList, defaultHeight: 300 }
];

const CustomerDetailPage = ({ customerId }) => {
  // Create height measurement cache
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 150
    })
  );

  // Page data state
  const [data, setData] = useState({
    customer: null,
    visits: [],
    orders: [],
    users: [],
    returnedOrders: []
  });

  // Row renderer
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

#### White Screen Optimization
Add skeleton screen display to avoid long white screen time.

#### Other Lag Optimization
Mainly discover lag points through testing team or user feedback, then investigate and solve accordingly. Common solutions:
- Debounce and throttle optimization to avoid frequent triggering of operations
- Add loading effects to buttons to avoid duplicate data submission
- Modal speed optimization, show modal first then do other related processing to avoid no response after clicking
- Because this version didn't have Fiber's rendering reconciliation algorithm, involving canvas and complex data calculations need manual optimization:
  - For content like image processing and canvas drawing, move to web worker
  - For large object data like template configuration data, parse into format more suitable for frontend components. Use reselect for caching
- Long list page optimization, such as user operation logs, old customer visit records, etc.
  - Use react-virtualized for virtualized display
  - Add load more button for scroll pagination to avoid loading all data at once
