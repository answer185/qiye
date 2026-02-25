---
toc: content
group: 
  title: Project Experience
  order: 1
order: 3
---
# System Component Library

## Background
For enterprise application products, from a page usage perspective, there are many similarities. Large ones include list page layouts, form page layouts, and data display patterns, while small ones include button styles, modal styles, and notification styles. Although there are component libraries like Ant Design, each enterprise has its own UI standards, especially for enterprises with strict design system requirements. At this point, it's necessary to perform secondary development and design on Ant Design and form an internal basic component library.

Additionally, from a business perspective, there are many common functions that can be abstracted, such as city selection, user selection, product selection, and order selection. Although they are business-coupled, they are basically consistent in usage.

To reduce code duplication and improve development efficiency across teams, these standardized components need to be extracted into a separate component library. This is very important for medium and large stable products.

If taken further, it could be considered to build a low-code platform, but the development cost is too high.

## Technical Solutions
### Secondary Development Based on Component Libraries
Can be developed based on component libraries like Ant Design, using tools like Rollup for packaging. If UI standard requirements are not very high, and only minor adjustments to component library UI styles are needed, this approach can be considered. If the system uses a micro-frontend architecture, it's also necessary to maintain consistent Ant Design versions, otherwise conflicts will occur.

### Development Based on shadcn/ui
Unlike component library-based solutions, shadcn/ui is not limited by component library issues. It can be completely customized, and shadcn/ui component library code will become the foundation code for this component library.

### Comparison
| Dimension | Ant Design Override Solution | shadcn/ui Built-in Solution |
|-----------|------------------------------|------------------------------|
| Dependencies | Strong dependency on antd version, need to handle peerDependencies | Zero runtime dependencies, component code completely self-contained |
| Style System | Need to manage global styles/LESS variable overrides | Use Tailwind CSS atomic styles, naturally isolated |
| Bundle Size | Need to cooperate with on-demand loading to reduce size | Automatically optimized through Tree Shaking, no redundant code |
| Customization Flexibility | Limited by Ant Design's API design | Can freely modify component source code, even replace underlying implementation |
| Micro-frontend Compatibility | Difficult to coexist with multiple versions | Naturally supports multiple instance coexistence |
| Upgrade Maintenance | Version upgrades may break existing styles | Each component evolves independently, no global impact |

## Implementation Plan
- First encapsulate 3-5 highest frequency components, then gradually expand, avoiding pursuing comprehensive coverage from the start
- Have visual documentation, similar to Ant Design documentation
- Can divide components into two categories: basic UI and business components
- Gradually replace based on pages or modules
- Collect feedback and continuously optimize

## Ant Design Encapsulation Example
### Results
- Component library implemented based on Ant Design
- Has one basic component: Button
- Has one business component: User Picker
- Supports on-demand loading
- Supports TypeScript

### Project Structure
```bash
├── packages/
│   ├── core/               # Basic components
│   │   ├── src/
│   │   │   ├── button/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── style.less
│   │   │   │   └── __tests__/
│   │   ├── index.ts        # Component export entry
│   │   └── package.json
│   │
│   ├── biz/                # Business components
│   │   ├── src/
│   │   │   ├── user-picker/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── interface.ts
│   │   │   │   └── __tests__/
│   │   ├── index.ts
│   │   └── package.json
│   │
├── config/
│   ├── rollup.config.js    # Build configuration
│   └── tsconfig.json
├── demo/                   # Development preview
├── .babelrc
├── package.json
└── README.md
```

### Component Code
1. Basic Button Component (packages/core/src/button/index.tsx)
```js
import React from 'react';
import { Button as AntdButton, ButtonProps } from 'antd';
import './style.less';

interface IButtonProps extends ButtonProps {
  /** Business custom type */
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

2. User Picker (packages/biz/src/user-picker/index.tsx)
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

### Build Configuration
1. Rollup Build Configuration (config/rollup.config.js)
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

2. TypeScript Type Export (packages/biz/src/user-picker/interface.ts)
```js
export interface UserInfo {
  id: string;
  name: string;
  dept: string;
  avatar?: string;
}

export interface UserPickerProps {
  /** User search API */
  api: (keyword: string) => Promise<UserInfo[]>;
  /** Selection mode */
  mode?: 'multiple' | 'single';
  /** Style class name */
  className?: string;
}
```

### On-demand Loading Solution
1. Babel Configuration (.babelrc)
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

2. Component Library Usage Example
```js
// On-demand import
import { Button } from 'your-component-lib/core';
import { UserPicker } from 'your-component-lib/biz';

// Business API integration
const fetchUsers = async (keyword: string) => {
  return request('/api/users', { params: { keyword } });
};

function Demo() {
  return (
    <>
      <Button businessType="warning">Risk Operation</Button>
      <UserPicker api={fetchUsers} />
    </>
  );
}
```

## shadcn/ui Encapsulation Example
### Results
- Component library implemented based on shadcn/ui + Tailwind CSS
- Has one basic component: Button
- Has one business component: User Picker
- Supports on-demand loading
- Supports TypeScript

### Project Structure
```bash
├── src/
│   ├── components/
│   │   ├── ui/               # Basic components (shadcn generated)
│   │   │   └── button.tsx
│   │   ├── biz/              # Business components
│   │   │   └── user-picker.tsx
│   ├── lib/
│   │   ├── utils.ts          # Utility functions
│   │   └── constants.ts      # Constants
│   ├── styles/
│   │   └── global.css        # Global styles
├── vite.config.ts            # Build configuration
├── tailwind.config.js        # Design system configuration
└── package.json
```

### Component Code
1. Basic Button Component (src/components/ui/button.tsx)
Directly modify in shadcn/ui's button component, though separation is also possible
```js
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

// 1. Define enterprise customization variants
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
        // Enterprise new type
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

// 2. Expose type interface
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
          <span className="mr-2 animate-spin">🌀</span> // Replace with enterprise loading component
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

2. Business User Picker (src/components/biz/user-picker.tsx)
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

// Type definitions
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

  // Filter logic
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

### Build Configuration
Here using Vite for building
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // Generate type declaration files
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

2. Tailwind Configuration (tailwind.config.js)
```js
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    // Reference path for users after publishing
    "../../node_modules/enterprise-ui/**/*.js" 
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3b82f6", // Enterprise primary color
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

3. Entry File (src/index.ts)
```js
// Basic components
export { Button } from "./components/ui/button"
export { buttonVariants } from "./components/ui/button"

// Business components
export { UserPicker } from "./components/biz/user-picker"

// Utility functions
export { cn } from "./lib/utils"
```

### On-demand Loading Solution
1. Publish as ES Module + CommonJS dual format
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

2. On-demand Import
```js
// Usage in business projects
import { Button } from "enterprise-ui" // Automatic Tree Shaking
import { UserPicker } from "enterprise-ui/components/biz/user-picker"
```

### Development and Build Commands
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "prepublishOnly": "npm run build",
    "storybook": "storybook dev -p 6006" // Optional: component documentation
  }
}
```
