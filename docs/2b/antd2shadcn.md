---
toc: content
group: 开发场景
order: 1
---

# 从Ant Design到shadcn/ui
## 背景
随着不断发展，公司的产品逐步形成自己的设计规范。一个基于Ant Design开发的后台管理系统越来越无法满足定制化的需求。随着这方面的需求越来越多。通过覆盖样式来修改组件的开发方式越来越难，效率越来越低。

## 技术选型
### CSS-IN-JS方式
使用css-in-js的方案，使用Styled-components对 Antd的组件进行封装，避免全局污染。
如:
```js
import { Button } from "antd";
import styled from "styled-components";

const CustomButton = styled(Button)`
  background: var(--primary-color);
  &:hover { opacity: 0.8; }

  // 覆盖 Ant Design 默认样式
  &.ant-btn {
    border-color: transparent;
    transition: opacity 0.2s;
  }

  // 处理 primary 类型的特殊情况
  &.ant-btn-primary {
    box-shadow: none;
  }
`;

// 主题配置（可选）
const theme = {
  primaryColor: "#1890ff"
};

// 使用示例
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

优点：
- 改动最小。
- 仍然能利用Ant Design的成熟生态。

缺点：
- CSS全局作用域的问题未根本解决。
- 打包体积仍然较大

### Headless的方案
使用shadcn/ui+Tailwind来定制化开发自己的组件库，逐步迁移，彻底解决定制问题。
不使用Radix等完全可以控的Headerless，是考虑开发成本的问题。

优点：
- 高度可定制化，告别样式污染。
- 开箱即用，比 Headless 方案开发更快。
- 社区活跃，插件生态丰富。
- 打包体积小，加载速度更快

缺点：
- 团队有学习成本


## 技术实现
### 迁移方案
基于页面和组件逐个迁移。建立跟踪文档，主要记录：
- 各路由的的迁移情况。
- 已开发的组件与antd组件的对应关系。
- 组件的特性对比

```js
// 创建迁移配置文件
// migration.config.ts
interface MigrationConfig {
  // 需要迁移的路由 
  routes: string[]
  // 组件映射关系
  componentMap: Record<string, string>
  // 特性对比
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

### 代码修改示例
原按钮使用的代码：
```js
// 迁移前的 Ant Design 按钮
import { Button } from 'antd'

function UserActions({ user }) {
  return (
    <div className='actions'>
      <Button type='primary' onClick={() => handleEdit(user)}>
        编辑
      </Button>
      <Button danger onClick={() => handleDelete(user)}>
        删除
      </Button>
    </div>
  )
}
```

迁移后的代码：
```js
import { Button } from '@/components/ui/button'

function UserActions({ user }) {
  return (
    <div className='flex gap-2'>
      <Button variant='default' onClick={() => handleEdit(user)}>
        编辑
      </Button>
      <Button variant='destructive' onClick={() => handleDelete(user)}>
        删除
      </Button>
    </div>
  )
}
```

### 表单组件代码
迁移前的代码：
```js
// 迁移前的 Ant Design 表单
import { Form, Input, Select } from 'antd'

function UserForm({ initialValues, onSubmit }) {
  const [form] = Form.useForm()

  return (
    <Form form={form} initialValues={initialValues} onFinish={onSubmit} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
      <Form.Item label='用户名' name='username' rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label='角色' name='role'>
        <Select>
          <Select.Option value='admin'>管理员</Select.Option>
          <Select.Option value='user'>普通用户</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  )
}
```

迁移前的代码：
```js
// 迁移后的 shadcn/ui 表单
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
              <FormLabel>用户名</FormLabel>
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
              <FormLabel>角色</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder='选择角色' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>管理员</SelectItem>
                  <SelectItem value='user'>普通用户</SelectItem>
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
从表面上看，迁移后的代码更复杂，这是因为：
1. 不同的心智模型：Ant Design 的 Form 组件有自己一套封装好的逻辑和 API，使用起来相对简洁，开发者只需要按照其规定的方式使用即可。而 shadcn/ui 更倾向于一种更灵活、更底层的实现方式，它依赖于 react-hook-form 这样的库来处理表单逻辑，需要开发者自己去组织和管理表单状态、验证等，所以代码量会增多。
2. 组件拆分更细：shadcn/ui 的表单组件被拆分成了多个小的组件，如 FormField、FormItem、FormLabel、FormControl 等，每个组件负责单一的功能，这使得代码结构更加清晰，但也增加了代码的行数。

所以，虽然迁移后的代码更复杂，但从长远来看，对于项目的可扩展性和维护性是有好处的。

### 样式迁移
shadcn/ui 基于 CSS Variables 和 Tailwind，为了继承ant-design的相关风格，需要同步相应的变量。如颜色、字体大小等。

我们通过生成CSS变量来做迁移，在实际迁移中逐步完善：
```js
// styles/theme-mapping.ts
const antdToShadcnMapping = {
  // 颜色映射
  '@primary-color': 'hsl(var(--primary))',
  '@success-color': 'hsl(var(--success))',
  '@warning-color': 'hsl(var(--warning))',
  '@error-color': 'hsl(var(--destructive))',

  // 字体映射
  '@font-size-base': '14px',
  '@font-size-lg': '16px',
  '@font-size-sm': '12px',

  // 圆角映射
  '@border-radius-base': 'var(--radius)',
  '@border-radius-sm': 'calc(var(--radius) - 2px)'
}

// 生成 CSS 变量
function generateCSSVariables() {
  return Object.entries(antdToShadcnMapping)
    .map(([antd, shadcn]) => {
      const name = antd.replace('@', '--')
      return `${name}: ${shadcn};`
    })
    .join('\n')
}

```

## 效果
- 打包体积：从 2.8MB 减少到 1.2MB
- 首屏加载时间：从 2.1s 减少到 1.3s
- 样式覆盖代码：减少了 80%
- 开发效率：提升了约 30%
