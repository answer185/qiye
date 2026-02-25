---
toc: content
group: 
  title: Development Scenarios
  order: 30
order: 1
---

# From Ant Design to shadcn/ui

## Background
With continuous development, the company's products gradually formed their own design standards. A backend management system based on Ant Design development increasingly cannot meet customization needs. As these needs grow, the development approach of modifying components through style overrides becomes increasingly difficult and inefficient.

## Technology Selection
### CSS-IN-JS Approach
Using css-in-js solution, encapsulating Antd components with Styled-components to avoid global pollution.
For example:
```js
import { Button } from "antd";
import styled from "styled-components";

const CustomButton = styled(Button)`
  background: var(--primary-color);
  &:hover { opacity: 0.8; }

  // Override Ant Design default styles
  &.ant-btn {
    border-color: transparent;
    transition: opacity 0.2s;
  }

  // Handle special cases for primary type
  &.ant-btn-primary {
    box-shadow: none;
  }
`;

// Theme configuration (optional)
const theme = {
  primaryColor: "#1890ff"
};

// Usage example
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CustomButton type="primary">
        Styled Button
      </CustomButton>
    </ThemeProvider>
  );
}
```

Advantages:
- Minimal changes.
- Can still leverage Ant Design's mature ecosystem.

Disadvantages:
- CSS global scope issues not fundamentally resolved.
- Bundle size still large.

### Headless Solution
Using shadcn/ui + Tailwind to custom develop your own component library, gradually migrating to completely solve customization issues.
Not using completely controllable Headless like Radix is considering development cost issues.

Advantages:
- Highly customizable, goodbye to style pollution.
- Ready to use, faster development than Headless solutions.
- Active community, rich plugin ecosystem.
- Small bundle size, faster loading speed.

Disadvantages:
- Team has learning costs.

## Technical Implementation
### Migration Plan
Migrate page by page and component by component. Establish tracking documentation, mainly recording:
- Migration status of each route.
- Correspondence between developed components and antd components.
- Component feature comparison.

```js
// Create migration configuration file
// migration.config.ts
interface MigrationConfig {
  // Routes to migrate
  routes: string[]
  // Component mapping relationships
  componentMap: Record<string, string>
  // Feature comparison
  featureMap: Record<
    string,
    {
      antd: string[]
      shadcn: string[]
      missing: string[]
    }
  >
}

const migrationConfig: MigrationConfig = {
  routes: ['/users', '/orders'],
  componentMap: {
    'antd/lib/button': '@/components/ui/button',
    'antd/lib/input': '@/components/ui/input',
    'antd/lib/select': '@/components/ui/select'
  },
  featureMap: {
    Button: {
      antd: ['loading', 'ghost', 'danger'],
      shadcn: ['loading', 'variant', 'size'],
      missing: ['ghost']
    }
  }
}
```

### Code Modification Example
Original button usage code:
```js
// Ant Design button before migration
import { Button } from 'antd'

function UserActions({ user }) {
  return (
    <div className='actions'>
      <Button type='primary' onClick={() => handleEdit(user)}>
        Edit
      </Button>
      <Button danger onClick={() => handleDelete(user)}>
        Delete
      </Button>
    </div>
  )
}
```

Code after migration:
```js
import { Button } from '@/components/ui/button'

function UserActions({ user }) {
  return (
    <div className='flex gap-2'>
      <Button variant='default' onClick={() => handleEdit(user)}>
        Edit
      </Button>
      <Button variant='destructive' onClick={() => handleDelete(user)}>
        Delete
      </Button>
    </div>
  )
}
```

### Form Component Code
Code before migration:
```js
// Ant Design form before migration
import { Form, Input, Select } from 'antd'

function UserForm({ initialValues, onSubmit }) {
  const [form] = Form.useForm()

  return (
    <Form form={form} initialValues={initialValues} onFinish={onSubmit} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label='Username' name='username' rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label='Role' name='role'>
        <Select>
          <Select.Option value='admin'>Admin</Select.Option>
          <Select.Option value='user'>User</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  )
}
```

Code after migration:
```js
// shadcn/ui form after migration
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

function UserForm({ defaultValues, onSubmit }) {
  const form = useForm({
    defaultValues,
    resolver: zodResolver(userSchema)
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='role'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder='Select role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='user'>User</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

On the surface, the migrated code is more complex, this is because:
1. Different mental models: Ant Design's Form component has its own set of encapsulated logic and APIs, relatively simple to use, developers just need to use it according to its prescribed way. While shadcn/ui tends towards a more flexible, lower-level implementation approach, it relies on libraries like react-hook-form to handle form logic, requiring developers to organize and manage form state, validation, etc. themselves, so code volume increases.
2. More granular component splitting: shadcn/ui's form components are split into multiple smaller components, such as FormField, FormItem, FormLabel, FormControl, etc., each component responsible for a single function, making code structure clearer but also increasing code lines.

So, although the migrated code is more complex, in the long run, it's beneficial for project scalability and maintainability.

### Style Migration
shadcn/ui is based on CSS Variables and Tailwind. To inherit ant-design related styles, corresponding variables need to be synchronized, such as colors, font sizes, etc.

We migrate by generating CSS variables, gradually improving during actual migration:
```js
// styles/theme-mapping.ts
const antdToShadcnMapping = {
  // Color mapping
  '@primary-color': 'hsl(var(--primary))',
  '@success-color': 'hsl(var(--success))',
  '@warning-color': 'hsl(var(--warning))',
  '@error-color': 'hsl(var(--destructive))',

  // Font mapping
  '@font-size-base': '14px',
  '@font-size-lg': '16px',
  '@font-size-sm': '12px',

  // Border radius mapping
  '@border-radius-base': 'var(--radius)',
  '@border-radius-sm': 'calc(var(--radius) - 2px)'
}

// Generate CSS variables
function generateCSSVariables() {
  return Object.entries(antdToShadcnMapping)
    .map(([antd, shadcn]) => {
      const name = antd.replace('@', '--')
      return `${name}: ${shadcn};`
    })
    .join('\n')
}
```

## Results
- Bundle size: Reduced from 2.8MB to 1.2MB
- First screen loading time: Reduced from 2.1s to 1.3s
- Style override code: Reduced by 80%
- Development efficiency: Improved by about 30%
