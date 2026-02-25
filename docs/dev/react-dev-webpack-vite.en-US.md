---
toc: content
group: 
  title: React Development
  order: 3
order: 4
---
# Webpack vs Vite Comparison

## Development Mode Differences
In the development environment, Webpack first bundles and then starts the development server, while Vite starts directly and then compiles dependency files on demand.

This means that when using Webpack, all modules need to be bundled before development, which increases startup time and build time. Vite, on the other hand, adopts a different strategy - it performs real-time compilation when modules are requested. This on-demand dynamic compilation mode greatly reduces compilation time, especially in large projects with numerous files, where Vite's advantages are more obvious.

## Different Support for ES Modules
Modern browsers natively support ES Modules and actively initiate requests to fetch required files. Vite takes full advantage of this by directly serving module files as files to be executed by the browser in the development environment, rather than bundling first like Webpack and then handing them to the browser for execution. This approach reduces intermediate steps and improves efficiency.

## Underlying Language Differences
Webpack is built on Node.js, while Vite is based on esbuild for pre-building dependencies. esbuild is written in Go language, which operates at the nanosecond level, while Node.js operates at the millisecond level. Therefore, Vite has a 10-100x improvement in packaging speed compared to Webpack.

## Build Approach
Webpack builds the entire project's dependency graph, bundling all resources into one or more bundle files, requiring bundling on every restart. Vite adopts an instant compilation approach, loading through browser-native ES Module features in development mode without bundling.

Moreover, Vite also performs pre-build dependency operations based on esbuild, i.e., pre-processing or building the dependencies required by the project before project startup or build. The benefit of this is that when the project actually runs, these pre-built dependencies can be used directly without real-time compilation or building, thereby improving application runtime speed and efficiency.

Webpack's corresponding feature is caching, which skips unchanged modules during secondary builds. Before webpack5, there was DLLPlugin (Dynamic Link Library), whose principle was to pre-package third-party libraries into separate dll.js files and reference them directly during development to avoid repeated builds.

## Development Experience
Webpack requires more configuration, and for complex projects, time and effort need to be spent configuring various loaders and plugins. Vite works out of the box, allowing quick project startup without complex configuration, and supports various plugins to meet specific needs.

## Hot Reload
Webpack's hot reload usually requires plugins like webpack-dev-server, which can be complex to configure in some cases. Vite has a built-in development server based on browser-native module hot reload, enabling fast hot reload without additional configuration.

## Configuration Complexity
- **Webpack**
  - Complex configuration (requires manual handling of Loader, Plugin, optimization options, etc.)
  - Example: Processing Vue/React projects requires configuring Babel, CSS loaders, etc.
- **Vite**
  - Works out of the box with preset support for TypeScript, JSX, CSS Modules, etc.
  - Simpler configuration (e.g., Vue projects only need to install @vitejs/plugin-vue)
