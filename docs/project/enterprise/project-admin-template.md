---
toc: content
group: 
  title: 项目经验
  order: 1
order: 1
---

# Admin模板
## 项目说明
### 这是什么项目
这是一个开箱即用的中台前端项目，用于快速搭建中后台的Web项目。具有：
- 面板页面
- 列表页面
- 表单页面
- 详情页面
- 用户模块
- 系统设置
- 结果页和异常页
等常见页面和模块。

同时还具有国际化的特性。

- [项目地址](https://github.com/answer185/nextjs-admin-template)
- [演示地址](https://admin-template.zengcreates.cn/zh/dashboard)

### 为什么做这个项目
在使用nextjs+shadcn-ui+tailwindcss做过项目后，感觉项目的性能和开发效率都有很大的提升。为了方便后续使用这个技术栈做项目，先搭建好模板并做好典型场景的DEMO。
同时也作为求职的演示项目。

## 技术选型
### React+TypeScript
Typescript能在编码期间发现代码错误，让重构过程不再那么痛苦，还能大幅提升集成开发环境（IDE）的自动补全功能，为团队中的新开发者提供内置文档。另外，配合强大的AI代码辅助工具，在处理类型代码时表现出会更加出色。

### NextJS
Next.js堪称Rect开发的“瑞士军刀”，功能齐全表现出色。目前最新版本已经支持React 19，集成了路由和API管理功能，还内置了性能优化机制。

### UI组件
使用Tailwind Css  + shadcn/ui 搭配，就能打造出强大的自定义组件。
- AI工具也能精准生成Tailwind类，
- shadcn/ui 提供开箱即用的无障碍组件，同时还能优化代码包体积。这样一来，你可以在保持设计一致性的同时 ，快速进行原型设计和迭代。

### 客户端状态管理
使用Zustand作为状态管理的选择，因为：
- 很少的样板代码
- 代码包极小
- API简单却功能强大
- 上手容易

对于部分跨组件的状态管理，还是使用Context。

### 表单处理
使用React Hook Form + Zod的方案。二者代码包小，API设计直观易懂。搭配后，可以很便捷地实现大部分表单开发场景。

### 托管服务
Vercel与React的结合堪称完美，此外，借助全球内容分发网络（CDN），你的应用在任何地方都能快速加载。
应用部署也很方便，无需复杂操作。
当前项目地址为: [点击访问](https://admin-template.zengcreates.cn/zh/dashboard)

## 工程化
### 初始化
项目的初始化是使用create-next-app实现，在安装过程中，选择：
- TypeScript
- Tailwindcss
- eslint
的特性

初始的依赖如下：
```json
{
  "name": "nextjs-admin-template",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.3.2"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "15.3.2",
    "@eslint/eslintrc": "^3"
  }
}
```
### 工程化改进
NextJS已经对项目的工程化做了很多的考虑，主要封装在eslint-config-next插件中，所以只要增加以下内容即可。
#### prettier
安装prettier，以增强代码规范化，相关依赖如下：
- prettier
- prettier-plugin-tailwindcss: 对tailwindcss进行排序
- @trivago/prettier-plugin-sort-imports: 对import语句进行排序

#### eslint规则增加
相关依赖如下
- eslint-config-prettier: 针对prettier，关闭冲突的规则
- eslint-plugin-unused-imports：检测并自动删除未使用的 imports（比 ESLint 原生 no-unused-vars 更精准），减少代码冗余。

#### 开发环境配置
主要配置.env.local，简单区别本地环境和线上环境。

#### 目录规范
代码全部放在src下，包括App路由
- src/app： app路由
- src/intl： 设置多语言
- src/libs: 系统内部的库
  - types.ts: 系统内部的数据类型
  - constants.ts: 系统内部的常量
- src/layouts: 放置layouts的组件及相关逻辑
- src/components: 存放业务组件
- src/styles: css的相关内容

## 前端架构
### 国际化
使用next-intl作为解决方案。其相关目录和文件有：
- src/intl 存放各语言的文件，目前支持zh和en
- src/i18n 存放next-intl用到的相关文件，routing,navigation和request配置
- app/[locale] 用于拦截多语言
- next.config.ts中配置使用next-intl的插件
- src/middleware.ts，设置相应的中间跳转
- src/app/page.tsx: 跳转到默认路由

### 组件库-shadcn/ui
使用shadcn/ui 及 Tailwindcss，以追求高性能和高定性的特性。

### 路由
使用App路由，增加[locale]父目录，用于拦截相应的语言。会包含各种路由的应用
- 动态路由： [locale]
- 普通路由：dashboard, login等目录
- 嵌套路由：如result/fail
- 路由组：如： (admin-pages), (full-width-pages)
- 并行路由：dashboard页面
- 拦截路由：列表页面拦截新建页面。

### 布局
根据是否是后台页面对路由进行分组：
- (admin): 后台页面
- (full-width-layout): 非后台页面，如login
具体的layout文件说明
- app/layout.tsx:  简单的转发，children，全局的html不在这里配置。
- app/[locale]/layout.tsx: html和body标签，以及加载系统的Providers组件
- app/[locale]/(full-width-pages)/layout.tsx: 全局展示的页面
- app/[locale]/(admin-pages)/layout.tsx: Admin后台页面的layout，带左侧菜单，头部，footer等内容。

### 全局Provider
主要包含：
- I18nProvider： 国际化的Provider
- ThemeProvider: 主题的Provider
- TooltipProvider： Tooltip的Provider

### 全局CSS
主要设置两种主题风格的css，对应文件是：styles/global.css

### 数据处理
- 使用lodash.merge风格的lodash函数库处理，根据需要安装相应的lodash函数。
