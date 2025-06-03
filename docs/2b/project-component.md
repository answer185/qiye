---
toc: content
group: 
  title: 项目经验
  order: 1
order: 3
---
# 系统组件库
## 背景
企业级应用的产品，从页面使用上看，会有很多的相似，大的有列表页面的布局、表单页面的布局以及数据展示的模式等，小的有按钮风格、弹窗的风格及提示的风格等。虽然会有像ant-deisgn这样的组件库，但是每个企业都会有自己的UI规范，特别是设计系统要求严苛的企业，这时就需要对ant-design进行二次开发和设计，并形成企业内部的基础组件库。

此外，从业务上来说，也会有很多相同的功能可以沉淀，比如城市选择，用户选择、商品选择及订单选择等。虽然也业务强耦合，但是它们在使用时，基本上是一致的。

为了减少代码的数据，提高各团队的开发效率，这些标准化的组件就需要单独抽离成组件库。这对中大型稳定产品来说很重要。

如果再进一步，可以考虑做成低代码平台，不过开发成本过高。

## 技术方案
### 基于组件库二次开发
可以基于组件库，如ant-design开发，使用rollup之类的工具打包。如果UI规范要求不是很高，只要针对组件库UI风格的小调整可以考虑使用。如果系统有使用微前端架构，还需要保持antd的版本一致，否则会产生冲突。

### 基于shadcn/ui开发
不同于基于组件库的方案，shadcn/ui没有受限于组件库的问题。它可以完全定制，将shadcn/ui的组件库代码会成为该组件库的基础代码。

### 对比
| 维度         | Ant Design 覆盖方案                       | shadcn/ui 内置方案                     |
|--------------|-------------------------------------------|----------------------------------------|
| 依赖关系     | 强依赖 antd 版本，需处理 peerDependencies | 零运行时依赖，组件代码完全自包含       |
| 样式系统     | 需要管理全局样式/LESS 变量覆盖            | 使用 Tailwind CSS 原子化样式，天然隔离 |
| 打包体积     | 需配合按需加载减少体积                    | 通过 Tree Shaking 自动优化，无冗余代码 |
| 定制灵活性   | 受限于 AntD 的 API 设计                   | 可自由修改组件源码，甚至替换底层实现   |
| 微前端兼容性 | 多版本共存困难                            | 天然支持多实例共存                     |
| 升级维护     | 版本升级可能破坏现有样式                  | 每个组件独立演进，无全局影响           |

## 落地方案
- 先封装3-5个最高频组件，再逐步扩展，避免一开始追求大而全。
- 有可视化的文档，类似ant-design的文档。
- 可以将组件分为两类：基础UI和业务组件。
- 根据页面或模块，逐步替换。
- 收集反馈，持续优化。

## ant-design封装示例
### 效果
- 组件库基于ant-desgign实现
- 拥有一个基础组件：按钮
- 拥有一个业务组件：用户选择
- 支持按需加载
- 支持Typescript

### 项目结构
```bash
├── packages/
│   ├── core/               # 基础组件
│   │   ├── src/
│   │   │   ├── button/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── style.less
│   │   │   │   └── __tests__/
│   │   ├── index.ts        # 组件导出入口
│   │   └── package.json
│   │
│   ├── biz/                # 业务组件
│   │   ├── src/
│   │   │   ├── user-picker/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── interface.ts
│   │   │   │   └── __tests__/
│   │   ├── index.ts
│   │   └── package.json
│   │
├── config/
│   ├── rollup.config.js    # 打包配置
│   └── tsconfig.json
├── demo/                   # 开发预览
├── .babelrc
├── package.json
└── README.md
```
### 组件代码
1. 基础按钮组件 (packages/core/src/button/index.tsx)
```js
import React from 'react';
import { Button as AntdButton, ButtonProps } from 'antd';
import './style.less';

interface IButtonProps extends ButtonProps {
  /** 业务自定义类型 */
  businessType?: 'primary' | 'warning';
}

const Button: React.FC<IButtonProps> = (props) => {
  const { businessType, className = '', ...rest } = props;
  
  return (
    <AntdButton
      {...rest}
      className={`business-btn ${businessType ? `business-btn-${businessType}` : ''} ${className}`}
    />
  );
};

export default Button;
```
2. 用户选择器 (packages/biz/src/user-picker/index.tsx)
```js
import React, { useState } from 'react';
import { Select, Spin } from 'antd';
import { debounce } from 'lodash-es';
import type { UserPickerProps, UserInfo } from './interface';

const UserPicker: React.FC<UserPickerProps> = ({ api, mode = 'multiple' }) => {
  const [options, setOptions] = useState<UserInfo[]>([]);
  const [fetching, setFetching] = useState(false);

  const fetchUsers = debounce(async (keyword: string) => {
    setFetching(true);
    try {
      const data = await api(keyword);
      setOptions(data.map(item => ({
        label: `${item.name}(${item.dept})`,
        value: item.id
      })));
    } finally {
      setFetching(false);
    }
  }, 500);

  return (
    <Select
      mode={mode}
      showSearch
      filterOption={false}
      onSearch={fetchUsers}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
    />
  );
};

export default UserPicker;
```

### 构建配置
1. Rollup 打包配置 (config/rollup.config.js)
```js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const isProd = process.env.NODE_ENV === 'production';

export default {
  input: 'packages/core/src/index.ts',
  output: [
    {
      dir: 'dist/esm',
      format: 'es',
      preserveModules: true,
      sourcemap: true,
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true,
      sourcemap: true,
    }
  ],
  plugins: [
    nodeResolve(),
    commonjs({
      include: /node_modules/,
    }),
    typescript({
      tsconfig: './config/tsconfig.json',
    }),
    postcss({
      extract: true,
      minimize: isProd,
    }),
    isProd && terser(),
  ],
  external: ['react', 'antd', 'lodash-es']
};
```
2. TS 类型导出 (packages/biz/src/user-picker/interface.ts)
```js
export interface UserInfo {
  id: string;
  name: string;
  dept: string;
  avatar?: string;
}

export interface UserPickerProps {
  /** 用户搜索API */
  api: (keyword: string) => Promise<UserInfo[]>;
  /** 选择模式 */
  mode?: 'multiple' | 'single';
  /** 样式类名 */
  className?: string;
}
```

### 按需加载方案
1. Babel 配置 (.babelrc)
```json
{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  "plugins": [
    ["import", {
      "libraryName": "your-component-lib",
      "libraryDirectory": "dist/esm",
      "camel2DashComponentName": false
    }]
  ]
}
```
2. 组件库使用示例
```js
// 按需引入
import { Button } from 'your-component-lib/core';
import { UserPicker } from 'your-component-lib/biz';

// 业务API对接
const fetchUsers = async (keyword: string) => {
  return request('/api/users', { params: { keyword } });
};

function Demo() {
  return (
    <>
      <Button businessType="warning">风险操作</Button>
      <UserPicker api={fetchUsers} />
    </>
  );
}
```

## shadcn/ui封装示例
### 效果
- 组件库基于shadcn/ui + tailwindcss实现
- 拥有一个基础组件：按钮
- 拥有一个业务组件：用户选择
- 支持按需加载
- 支持Typescript

### 项目结构
```bash
├── src/
│   ├── components/
│   │   ├── ui/               # 基础组件 (shadcn生成)
│   │   │   └── button.tsx
│   │   ├── biz/              # 业务组件
│   │   │   └── user-picker.tsx
│   ├── lib/
│   │   ├── utils.ts          # 工具函数
│   │   └── constants.ts      # 常量
│   ├── styles/
│   │   └── global.css        # 全局样式
├── vite.config.ts            # 打包配置
├── tailwind.config.js        # 设计系统配置
└── package.json
```
### 组件代码
1. 基础按钮组件 (src/components/ui/button.tsx)
直接在shadcn/ui的button组件中修改，当然分离也可以
```js
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

// 1. 定义企业定制化变体
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // 企业新增类型
        premium: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// 2. 暴露类型接口
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 animate-spin">🌀</span> // 替换为企业 loading 组件
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```
2. 业务用户选择器 (src/components/biz/user-picker.tsx)
```js
import * as React from "react"
import { Button } from "../ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

// 类型定义
export interface User {
  id: string
  name: string
  department: string
}

interface UserPickerProps {
  users: User[]
  selectedUsers: User[]
  onSelect: (user: User) => void
  className?: string
}

export function UserPicker({
  users,
  selectedUsers,
  onSelect,
  className,
}: UserPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  // 过滤逻辑
  const filteredUsers = React.useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  }, [users, searchTerm])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[300px] justify-between", className)}
        >
          {selectedUsers.length > 0
            ? `${selectedUsers.length} users selected`
            : "Select users..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search users..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {filteredUsers.map((user) => (
              <CommandItem
                key={user.id}
                value={user.id}
                onSelect={() => {
                  onSelect(user)
                  setSearchTerm("")
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUsers.some(u => u.id === user.id)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {user.name} ({user.department})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

### 构建配置
这里使用Vite构建
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // 生成类型声明文件
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'EnterpriseUI',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'tailwind-merge', 'class-variance-authority'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
```

2. Tailwind 配置 (tailwind.config.js)
```js
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    // 发布后使用方的引用路径
    "../../node_modules/enterprise-ui/**/*.js" 
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6", // 企业主色
          foreground: "#ffffff"
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff"
        }
      }
    }
  },
  plugins: [],
}
```

3. 入口文件 (src/index.ts)
```js
// 基础组件
export { Button } from "./components/ui/button"
export { buttonVariants } from "./components/ui/button"

// 业务组件
export { UserPicker } from "./components/biz/user-picker"

// 工具函数
export { cn } from "./lib/utils"
```

### 按需加载方案
1. 发布为 ES Module + CommonJS 双格式
```json
// package.json
{
  "name": "enterprise-ui",
  "version": "0.1.0",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.es.js",
  "types": "./dist/index.d.ts",
  "sideEffects": false,
  "files": ["dist", "src"],
  "peerDependencies": {
    "react": ">=18",
    "tailwindcss": "^3.0.0"
  }
}
```

2. 按需引入
```js
// 业务项目中使用
import { Button } from "enterprise-ui" // 自动 Tree Shaking
import { UserPicker } from "enterprise-ui/components/biz/user-picker"
```

### 开发与构建命令
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "prepublishOnly": "npm run build",
    "storybook": "storybook dev -p 6006" // 可选：组件文档
  }
}
```
