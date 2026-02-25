---
toc: content
group: 
  title: Scenario Solutions
  order: 2
order: 1
---
# Frontend Tracking and Monitoring

## Concepts
Frontend tracking refers to inserting specific code in web pages or applications to collect user behavior data and send it to servers for analysis. This data can include user clicks, browsing, input, and other operations, helping developers understand user behavior on their websites, enabling targeted optimization and improvement.

Frontend tracking usually includes the following steps:
1. Define events: Define data events that need to be collected, such as clicks, browsing, etc.
2. Add code: Add specific code in web pages or applications to collect event data.
3. Send data: Send collected data to servers for analysis.
4. Analyze data: Analyze and mine collected data to find user behavior patterns and needs, providing basis for product improvement and optimization.

## Frontend Monitoring
### Data Monitoring
Mainly focuses on user behavior and interaction in websites or applications:
- PV: Page views or click volume;
- UV: Number of different IP addresses accessing a site or clicking news
- User dwell time on each page
- How users access the webpage
- User-triggered behaviors on corresponding pages

### Performance Monitoring
Mainly focuses on website or application loading speed, response time, and user experience:
- First screen loading time for different users, devices, and systems
- White screen time
- Response time of HTTP and other requests
- Overall download time of static resources
- Page rendering time
- Page interaction animation completion time

### Exception Monitoring
Mainly focuses on whether errors or exceptions occur during website or application operation:
- JavaScript exception monitoring
- Style loss exception monitoring

## Performance Data
### Reported Data
Common ones include:
- unload: Previous page unload time, calculated through unloadEventEnd-unloadEventStart
- redirect: Redirect time, redirectEnd - redirectStart
- appCache: Cache time, domainLookupStart - fetchStart
- dns: DNS resolution time, domainLookupEnd - domainLookupStart
- tcp: TCP connection time, connectEnd - connectStart
- response: Response data transmission time, responseEnd - responseStart
- First render time: responseEnd - fetchStart
- First interactive time: domInteractive - fetchStart
etc.
Calculate according to actual needs.

### Data Acquisition Methods
#### window.performance.timing
Although browsers still support it, it has been removed from Web standards.

#### PerformanceNavigationTiming
Can be obtained through window.performance.getEntriesByType('navigation');
```js
// Get current page navigation timing data (returns array)
const navigationEntries = performance.getEntriesByType('navigation');

// Usually take the first element (current page navigation record)
const navigationTiming = navigationEntries[0];

// Key metrics example (unit: milliseconds, actually stored as nanosecond-level floating point)
console.log({
  // Key stage time
  dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
  tcp: navigationTiming.connectEnd - navigationTiming.connectStart,
  ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
  
  // Important time points (relative to performance.timeOrigin)
  loadEventEnd: navigationTiming.loadEventEnd,
  domComplete: navigationTiming.domComplete
});
```

#### Data Reporting
Listen to load events, report through navigator.sendBeacon() to avoid blocking page unload:
```js
// Comprehensive monitoring example
function collectPerfMetrics() {
  // 1. Navigation timing data
  const [navTiming] = performance.getEntriesByType('navigation');
  
  // 2. Resource loading data
  const resources = performance.getEntriesByType('resource');
  
  // 3. Key business metrics (such as FP/FCP)
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

// Trigger collection at appropriate time
window.addEventListener('load', () => {
  setTimeout(() => {  // Wait for all resources to load
    const metrics = collectPerfMetrics();
    navigator.sendBeacon('/api/perf', JSON.stringify(metrics));
  }, 0);
});
```

The above reporting method might miss LCP data. It's best to observe and report needed types through PerformanceObserver:
```js
function sendMetric(metricName, value) {
  const data = {
    name: metricName,
    value: value,
    page: location.href,
    timestamp: Date.now()
  };
  
  // Use sendBeacon for reporting (recommended solution)
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  navigator.sendBeacon('/api/perf-metrics', blob);
}

// Performance monitoring dedicated Observer
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

// Start monitoring (simultaneously listen to multiple types)
perfObserver.observe({
  entryTypes: [
    'navigation',
    'paint',
    'largest-contentful-paint',
    'first-input'
  ]
});

// Separately monitor CLS (layout shift)
const clsObserver = new PerformanceObserver((list) => {
  let cumulativeLayoutShift = 0;
  list.getEntries().forEach(entry => {
    if (!entry.hadRecentInput) cumulativeLayoutShift += entry.value;
  });
  sendMetric('CLS', cumulativeLayoutShift);
});

clsObserver.observe({ type: 'layout-shift', buffered: true });
```

### Performance Identifier Design
Reported performance data needs unique identifiers for easy querying. Can be distinguished through the following parameters:
1. User identification:
   - User ID (if system has logged-in user system)
   - Anonymous user ID (can use UUID stored in cookie/localStorage)
2. Device/environment information:
   - User Agent (contains browser, operating system information)
   - Screen resolution (window.screen.width and window.screen.height)
   - Device type (can be determined through User Agent or navigator.userAgentData.mobile)
   - Network type (navigator.connection.effectiveType)
3. Page information:
   - Complete URL (window.location.href)
   - Page path (window.location.pathname)
   - Query parameters (if need separate analysis)
   - Page title (document.title)
4. Session information:
   - Session ID (generate unique ID for each visit)
   - Visit timestamp

Example code:
```js
// Generate or get user ID
function getUserId() {
  let userId = localStorage.getItem('performanceUserId');
  if (!userId) {
    userId = 'user-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('performanceUserId', userId);
  }
  return userId;
}

// Generate session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem('performanceSessionId');
  if (!sessionId) {
    sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('performanceSessionId', sessionId);
  }
  return sessionId;
}

// Collect performance data and report
function collectAndReportPerformance() {
  const performanceData = {
    // User and session information
    userId: getUserId(),
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
    
    // Device information
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    connectionType: navigator.connection?.effectiveType || 'unknown',
    
    // Page information
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer,
    
    // Performance metrics
    ...getPerformanceMetrics()
  };
  
  // Use sendBeacon for reporting
  const blob = new Blob([JSON.stringify(performanceData)], {type: 'application/json'});
  navigator.sendBeacon('/api/performance', blob);
}

// Get specific performance metrics
function getPerformanceMetrics() {
  // Use PerformanceObserver and PerformanceNavigationTiming to get specific metrics
  // Return metrics like loadTime, FCP, LCP, etc.
}
```

## Business Tracking Data
### Tracking Classification
- Page behavior: Such as page visits and dwell time
- Interaction behavior: Such as clicks and scrolling
- System behavior: Such as startup, crashes
Of course, can also be classified by other dimensions, such as by business layer, technical implementation method, etc.

### Tracking Solutions
#### Manual Tracking
This is also the most commonly used solution. The process is generally:
- Product managers determine each event name
- Use third-party or internal self-developed tracking SDKs to add corresponding calling code at appropriate locations.

Advantages: High flexibility, can precisely capture various complex user behaviors.
Disadvantages: High development cost, requires certain technical threshold.

#### Visual Tracking
The principle is:
- Generate corresponding tracking rules through a visual system management page and tracking configuration. Generally JSON configuration files.
- Dynamically load this configuration in the tracking SDK
- Parse this configuration and do tracking reporting

Compared to manual tracking, advantages are:
- Low tracking maintenance cost: Basically operated by non-technical personnel later
- Can centrally manage tracking requirements

Disadvantages:
- High initial cost: Need to build configuration platform.
- Less flexible than manual configuration: Cannot handle beyond configuration rules.
- Less accurate than manual configuration: For example, dependent class selector changes might split data for the same event into two.

Can be based on open source systems for secondary development, such as:
- Mixpanel
- Matomo
- OpenReplay
etc.

#### Seamless Tracking
The principle is global listening, automatically recording user interaction behaviors by hijacking or listening to global events (clicks, scrolling, page jumps, etc.).
Generally generate event identifiers through CSS selectors + hierarchical paths.

**Advantages:**
- No need to manually add tracking code, can greatly reduce development costs.

**Disadvantages:**
- Will collect large amounts of redundant data, difficult to precisely capture some complex user behaviors.
- Need to filter data.

Open source projects include: rrweb

### Other Tracking Solutions
#### Vue directive method
Pass event names through directives, then report:
```js
Vue.directive('collect', {
    inserted(el, binding) {
        const { value } = binding;
        if (value) {
            // Nodes need explicit declaration here for subsequent tracking event expansion
            const { click = false } = binding.modifiers;
            if (click) {
                // Bind elements here to achieve injection
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
    unbind(el, binding) {
        // doSomething....
    }
});
```

#### Add dataset identifiers on elements
Such as data-track-id and data-params, then unified event capture, find all elements with related identifiers, and do listening and reporting.
```html
<button data-track-id="product_123_buy">Buy</button>
```

#### Error Data Reporting
Capture errors by listening to error events:
```js
window.addEventListener('error', e => {
    console.log('e: ', e);
})
```

Promise error capture:
```js
window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    e.preventDefault();

    e.promise.catch((error) => {
        // Distinguish two types of promise error messages
        let msg = error?.message || error;
        this.sendData({ type: 'promise', msg })
    })
})
```

Resource loading errors, distinguish by error type:
```js
window.addEventListener('error', e => {
    e.preventDefault();

    // Judge error type
    const isErrorEvent: Boolean = e instanceof ErrorEvent;

    if (!isErrorEvent) { // Resource loading error
        this.sendData(
            {
                type: 'resource',
                msg: e.message,
            }
        );
        return;
    }

    this.sendData( // js error
        {
            type: 'js',
            msg: e.message,
        }
    )

}, true)
```

## Data Reporting Methods
### XHR Interface
Upload data through backend interface integration, need to pay attention to cross-origin issues.

### img Tag
Disguise as an image URL request to avoid cross-origin issues. Shortcoming is URL length limitation, so not available for large data volume reporting scenarios.

### sendBeacon
The above two methods have data loss problems after refresh, can use sendBeacon() to solve.
sendBeacon() method is used to asynchronously transmit data to servers, usually for collecting user behavior data or tracking user activity. This method can ensure data is sent to servers before page close or refresh, avoiding data loss.
```js
navigator.sendBeacon('http://127.0.0.1:5500/data', JSON.stringify({
    event: 'pageview',
    url: window.location.href,
    time: Date.now()
}));
```

Shortcoming: May have browser compatibility issues.

## Summary
Frontend tracking and monitoring are core tools for optimizing user experience and product iteration. By collecting user behavior (clicks, browsing), performance metrics (LCP, FID), and exception data (JS errors, resource loading failures), they help developers precisely analyze problems. The above content is not everything. For example, in actual development, we also need to consider SDK and reporting in weak networks or retry after reporting failures.
