---
toc: content
group: 
  title: React Development
  order: 3
order: 2
---
# shadcn/ui Usage Guide

## I. Introduction
The shadcn/ui project, strictly speaking, is not a component library, but a tool that lets you build your component library.

Traditional component library workflow:
- Install dependencies via NPM
- Import components
- Use them in applications.

shadcn/ui generates component code into your project through CLI tools, meaning you have complete control over component implementation logic and styles. This solves the pain point of poor customizability in traditional component libraries.

It's built on Radix UI and Tailwind CSS. Radix UI is a Headless component library with no styles, allowing users to customize freely as needed. Tailwind CSS is a utility-first CSS framework that provides a large number of low-level CSS classes, allowing developers to build UIs directly by combining class names without writing custom CSS. The combination of both enjoys the convenience of ready-made components while having complete control over style details.

## II. Applicable Scenarios and Comparison
### 2.1 Applicable Scenarios
- Projects requiring highly customized UI (such as strongly branded SaaS products)
- Hope to avoid CSS class name conflicts (Tailwind + CSS variable solution)

### 2.2 Comparison with Ant Design and MUI

| Feature     | shadcn/ui           | Ant Design      | Material UI         |
|-------------|---------------------|-----------------|---------------------|
| Customization | ⭐⭐⭐⭐⭐ (Direct source code modification) | ⭐⭐⭐ (Configuration override) | ⭐⭐ (ThemeProvider) |
| Design Style | Modern, Clean       | Enterprise      | Google Material     |
| Theme Switching | CSS Variables      | Less Variables  | CSS-in-JS           |
| Bundle Size | On-demand import    | Large           | Large               |
| Use Cases   | Flexible frontend projects | Backend management systems | Mobile/Web apps |

**Conclusion:**
- If you want complete control over UI, shadcn/ui is the best choice.
- If you need to quickly build backend systems, Ant Design is more suitable.

## III. Basic Usage
The following is based on Next.js framework usage.

### 3.1 Installation
Execute in Next.js project:
```bash
npx shadcn@latest init
```

This command mainly does the following:
- Generate core configuration file: component.json, and initialize related configurations, interfacing with Next.js. Generally, no changes are needed.
- Modify tailwind.config.ts: Inject shadcn/ui related CSS variables.
- Modify app/global.css, inject light/dark theme CSS variables
- Create utility file: lib/utils.ts, based on clsx and tailwind-merge, solving class name conflict issues.

### 3.2 Component Usage
Component usage, overall speaking, their operation steps are consistent:
- Use CLI commands to install components. After installation, corresponding component code files will be generated under src/components/ui.
- In the project, import corresponding components from components/ui and use them.

Official also provides manual installation steps, but generally not used this way.
During development, if you want to completely customize the component, you can also directly use @radix-ui/component for development.

Taking accordion as an example:
Installation:
```shell
npx shadcn@latest add accordion
```

Usage:
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

### 3.3 Blocks Usage
Blocks are ready-made page templates, such as login for backend systems, dashboard pages.
Usage is the same as components. First use CLI to install the corresponding block, such as:
```shell
npx shadcn@latest add sidebar-07
```

After installation, corresponding files will be created:
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

View through /dashboard

## IV. Project Practical Scenarios
### 4.1 Theme Switching (Dark Mode)
Based on next-themes implementation

**Install next-themes**
```shell
npm install next-themes
```

Create components/theme-provider.tsx:
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

Apply ThemeProvider in Root layout:
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

The suppressHydrationWarning attribute prevents warnings when server-side rendering and client-side rendering results are inconsistent. Because the server cannot accurately know the user's theme preference, it may render styles inconsistent with user preferences.

Add mode toggle button:
Mainly based on next-themes' useTheme implementation, can pass 3 values:
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

### 4.2 Tooltip Component Usage
This component usage is similar to other components. After installing with CLI, import the corresponding component. Note the position of TooltipProvider.

This Provider component passes the following key information to child components through React Context:
- Tooltip open/close state (open)
- Trigger and close logic (such as mouse hover, click, and other interaction behaviors)
- Global configuration (such as delayDuration, disableHoverableContent, etc.)

This data is shared by child components like Tooltip, TooltipTrigger, TooltipContent, ensuring they can work together.
If not used, tooltip cannot be used.

Usually in actual projects, this component is placed in the global layout component.
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

The reasons are as follows:
- Initialize once, globally available. All child components can share its context, avoiding rendering multiple Providers.
- Through React Context, even with multiple Tooltip child components, there won't be state conflicts.
  - Automatically close other prompts: When users hover/trigger a new Tooltip, Provider automatically closes previously opened prompts (avoiding multiple floating prompts appearing on the page simultaneously).
  - State isolation: Each Tooltip component internally maintains its own open state, but achieves unified scheduling through shared Provider.
- Cleaner code: No need to repeatedly include TooltipProvider in every place it's used

The following situations don't recommend placing globally:
- Tooltip is only used on a few pages.
- Need independent behavior control, such as delay time.
- TooltipProvider overhead is minimal, but if pursuing ultimate performance, global configuration can also be removed.

Alternative: Can be included in the corresponding Page page and pass corresponding independent configuration, such as:
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

### 4.3 Form Development
shadcn/ui doesn't have powerful form functionality like antd. Needs to be combined with react-hook-form+zod for application.
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

### 4.4 List Page Development
For backend systems, search + table is a common list page style. When searching, skeleton screens need to be displayed.
Can be implemented based on skeleton, table, form, and other components:
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

### 4.5 Report Pages
Generally also combined with recharts.
```js
import { BarChart } from "@/components/ui/chart"; // Custom wrapper
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

### 4.6 Others
Component application is basically covered by official documentation. In development, we may also have:
- Override default styles: Just pass appropriate className.
```html
<Button className="bg-red-500 hover:bg-red-600" />
```
- Dynamic component loading:
Combined with Next.js's dynamic:
```js
import dynamic from "next/dynamic"
const DynamicModal = dynamic(() => import("@/components/modal"));
```
- Component extension
Generally create new files directly under components/ui. But this might be confused with shadcn/ui components, possibly distinguished through separate directories or naming conventions.
- Directly modify shadcn/ui installed components: Although override is supported, best practice is to directly modify component styles. This is shadcn/ui's core concept: components are code, not dependencies.
  - Don't worry about code being reverted after reinstalling dependencies. Unless re-executing shadcn's CLI install command, there will be no impact.

## V. Summary
### 5.1 Advantages
- ✔ Ultimate customization, suitable for strongly branded projects
- ✔ No CSS conflicts, Tailwind first
- ✔ On-demand import, optimize bundle size

### 5.2 Disadvantages
- ❌ Need to manually manage component updates (not NPM dependencies)
- ❌ Slightly higher learning curve (need to be familiar with Tailwind + Radix)
