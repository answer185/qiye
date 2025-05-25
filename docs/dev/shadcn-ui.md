---
toc: content
group: 
  title: React开发
  order: 3
order: 2
---
# shadcn/ui使用指南
## 一、简介
shadcn/ui项目，从严格意义上来说，它并不是一组件库，而是让你构建你的组件库的工具。
传统的组件库工作方式是：
- NPM安装依赖
- 导入组件
- 在应用程序中使用它们。
而shadcn/ui是通过CLI工具，将组件代码生成到你的项目中，这意味着你可以完全控制组件的实现逻辑和样式。这解决了传统组件库可定制性差的痛点。
它的底层是基于Radix UI和Tailwind CSS实现，Radix UI是一个Headless的组件库，即没有样式，用户可以根据需要自由定制。Tailwind CSS是一个实用优先的CSS框架，它提供了大量低级别的CSS类。让开发者可以直接通过组合类名来构建UI，而无需写自定义CSS。二者的结合，既能享受现成组件的便利，又能完全掌控样式细节。
## 二、适用场景和对比
### 2.1 适用场景
- 需要高度定制化 UI 的项目（如品牌化强的 SaaS 产品）
- 希望避免 CSS 类名冲突（Tailwind + CSS 变量方案）
### 2.2 与Ant-Design及MUI的对比

| 特性     | shadcn/ui           | Ant Design      | Material UI         |
|----------|---------------------|-----------------|---------------------|
| 定制化   | ⭐⭐⭐⭐⭐（直接改源码） | ⭐⭐⭐（配置覆盖） | ⭐⭐（ThemeProvider） |
| 设计风格 | 现代、简洁          | 企业级          | Google Material     |
| 主题切换 | CSS 变量            | Less 变量       | CSS-in-JS           |
| 打包体积 | 按需引入            | 较大            | 较大                |
| 适用场景 | 灵活前端项目        | 中后台管理系统  | 移动/Web 应用       |

**结论：**
- 如果你想要完全控制 UI，shadcn/ui 是最佳选择。
- 如果需要快速搭建中后台，Ant Design 更合适。
## 三、基础使用
以下是基于Nextjs框架的使用
### 3.1 安装
在nextjs项目中执行
npx shadcn@latest init
该命令主要做了以下的事：
- 生成核心配置文件：component.json，并初始化相关配置，与nextjs对接。一般情况下，不需要去改。
- 修改tailwind.config.ts:注入shadcn/ui的相关css变量。
- 修改app/global.css，注入亮色/暗色主题的css变量
- 创建工具文件：lib/utils.ts，基于clsx和tailwind-merge，解决类名冲突的问题。
### 3.2 组件使用
组件的使用，总体上来说，他们的操作步骤是一致的：
- 使用CLI命令安装组件，安装后，会在src/components/ui下生成相应的组件代码文件。
- 在项目中，导入components/ui下的相应组件，并使用即可。
官方也提供手动安装的步骤，但一般不会这么用。
在开发时，如果想完全对该组件定制，也可以直接使用@radix-ui/component来进行开发。
以accordion为例：
安装：
```shell
npx shadcn@latest add accordion
```
使用：
```js
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other
          components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you
          prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```
### 3.3 Blocks使用
Blocks是现成的页面模板，比如中后台系统的登录，dashboard页面。
使用方式同组件，先使用CLI安装相应的block，如：
```shell
npx shadcn@latest add sidebar-07
```
安装后，会创建相应的文件
```
- src/app/dashboard/page.tsx
- src/components/app-sidebar.tsx
- src/components/nav-main.tsx
- src/components/nav-projects.tsx
- src/components/nav-user.tsx
- src/components/team-switcher.tsx
- src/components/ui/sidebar.tsx
- src/components/ui/button.tsx
- src/components/ui/separator.tsx
- src/components/ui/sheet.tsx
- src/components/ui/tooltip.tsx
- src/components/ui/input.tsx
- src/hooks/use-mobile.ts
- src/components/ui/skeleton.tsx
- src/components/ui/breadcrumb.tsx
- src/components/ui/collapsible.tsx
- src/components/ui/dropdown-menu.tsx
- src/components/ui/avatar.tsx
```
通过/dashboard上查看
## 四、项目实战场景
### 4.1 主题切换（暗黑模式）
基于next-themes实现
**安装next-themes**
```shell
npm install next-themes
```
创建components/theme-provider.tsx
```js
"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```
Root layout中应用ThemeProvider
```js
import { ThemeProvider } from "@/components/theme-provider"
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
```

其中suppressHydrationWarning属性的作用是防止服务端渲染与客户端渲染结果不一致时，输出警告。因为服务器无法准确知道用户的主题偏好，所以可能渲染出与用户偏好不一致的风格。
添加模式切换按钮
主要基于next-themes的useTheme实现，可以传入3个值：
- Light
- dark
- system
```js
"use client"
import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
export function ModeToggle() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```
### 4.2 Tooltip组件的使用
这个组件的使用与其他组件类似，使用CLI安装后，导入相应的组件即可。需要注意的是TooltipProvider的位置 。
这个Provider组件通过 React Context 向子组件传递以下关键信息：
- 工具提示的打开/关闭状态（open）
- 触发和关闭的逻辑（如鼠标悬停、点击等交互行为）
- 全局配置（如 delayDuration、disableHoverableContent 等）
这些数据被 Tooltip、TooltipTrigger、TooltipContent 等子组件共享，确保它们能协同工作。
如果不使用，tooltip将无法使用。
通常在实际项目中，会考虑将这个组件放在全局的layout组件中。
```js
// app/layout.tsx
import { TooltipProvider } from "@/components/ui/tooltip";
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
```
其原因如下：
- 一次初始化，全局可用。所有子组件都能共享它的上下文，避免渲染多个Provider。
- 通过React Context，就算有多个Tooltip子组件，也不会有状态冲突。
  - 自动关闭其他提示：当用户悬停/触发一个新的 Tooltip 时，Provider 会自动关闭之前打开的提示（避免页面同时出现多个悬浮提示）。
  - 状态隔离：每个 Tooltip 组件内部维护自己的打开状态（open），但通过共享的 Provider 实现统一调度。
- 代码更简洁：无需要在每个用到的地方重复包含TooltipProvider
有以下情况不建议放在全局：
- Tooltip只在少量页面使用。
- 需要独立控制行为，比如延迟时间。
- TooltipProvider的开销是极小的，但是如果要做极致的性能，也可以考虑去掉全局的配置。
替代方案：可以包含在应的Page页面即可，并传入相应的独立配置，如：
```js
// app/[pathname]/page.tsx
export default function Page() {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```
### 4.3 表单开发
shadcn/ui没有像antd那样强大的表单功能。需要与react-hook-form+zod结合来应用。
```js
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
const schema = z.object({
  email: z.string().email(),
});
export function SignupForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });
  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register("email")} />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```
### 4.4 列表页面开发
对中后台系统来说，搜索+表格是常见的列表页面风格，在搜索时，需要展示骨架图。
可以基于skeleton、table, form等组件实现
```js
import { Skeleton } from "@/components/ui/skeleton";
export function UserList() {
  const { data, isLoading } = useFetchUsers();
  if (isLoading) {
    return <Skeleton className="h-8 w-full" />;
  }
  return <div>{data.map(user => <div key={user.id}>{user.name}</div>)}</div>;
}
```
### 4.5 报表页面
一般也recharts结合使用。
```js
import { BarChart } from "@/components/ui/chart"; // 自定义封装
export function Dashboard() {
  return (
    <BarChart
      data={salesData}
      xAxis="month"
      yAxis="revenue"
    />
  );
}
```
### 4.6 其他
组件的应用，基本上官方文档即可。在开发中，我们还可能有：
- 覆盖默认样式：直接传入合适的className即可。
```html
<Button className="bg-red-500 hover:bg-red-600" />
```
- 动态加载组件：
结合 Next.js 的 dynamic：
```js
import dynamic from "next/dynamic"
const DynamicModal = dynamic(() => import("@/components/modal"));
```
- 组件扩展
一般直接在components/ui下创建新文件。但是这样可能与shadcn/ui的组件混淆，可能通过单独目录或命名规范来区分。
- 直接修改shadcn/ui已安装的组件：虽然支持覆盖，但是最佳实践还是直接对组件进行风格修改。这是shadcn/ui的核心理念：组件是代码，不是依赖。
  - 不用担心重新安装依赖后代码会被还原。除非重新执行shadcn的cli安装命令，否则不会有影响。
## 五、总结
### 5.1 优点
- ✔ 极致定制化，适合品牌化强的项目
- ✔ 无 CSS 冲突，Tailwind 优先
- ✔ 按需引入，优化打包体积
### 5.2 缺点
- ❌ 需要手动管理组件更新（非 NPM 依赖）
- ❌ 学习曲线略高（需熟悉 Tailwind + Radix）
