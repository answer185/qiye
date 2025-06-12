---
toc: content
group: 
  title: 开发场景
  order: 30
order: 3
---

# shadcn/ui开发总结
## Icons扩展
我们的项目中会使用以下两个库作为扩展：
- [lucide-react](https://lucide.dev/icons/)
- [@tabler/icons-react](https://tabler.io/icons)

其中lucide-react的体积更小，但是Icon图标数量也会更少。@tabler/icons-react图标更多，有近6000个。
两个库都支持按需要加载，所以同时使用也没事，在构建时，只会打包导入的Icon图标。

以下是二者的使用方式：
### lucide-react
```js
import { Camera, Heart } from "lucide-react";

<Camera />
<Heart />
```
在找到图标后，直接点击Copy JSX按钮，即为组件的代码。

其主要的props有：

| Prop                | 类型                | 默认值       | 说明                                       |
|---------------------|---------------------|--------------|--------------------------------------------|
| size                | number / string     | 24           | 图标大小（"1em"、20）                      |
| color               | string              | currentColor | 颜色（"#ff0000"）                          |
| strokeWidth         | number              | 2            | 线条粗细（1.5、2、3）                      |
| absoluteStrokeWidth | boolean             | false        | 是否强制使用 strokeWidth（不受 size 影响） |
| className           | string              | -            | 自定义 CSS 类名                            |
| style               | React.CSSProperties | -            | 内联样式                                   |

项目示例
```js
<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
```
- ml-auto - 设置左边距自动(margin-left: auto)，使元素向右对齐
- transition-transform - 指定 transform 属性应该有过渡效果
- duration-200 - 设置过渡持续时间为 200ms
- group-data-[state=open]/collapsible:rotate-90 - 这是一个复杂的自定义类，分解如下：
  - group - 允许子元素根据父元素的状态设置样式
  - data-[state=open] - 当父元素有 data-state="open" 属性时应用
  - /collapsible - 作用域限定，只对带有 collapsible 类的组生效
  - :rotate-90 - 当上述条件满足时，元素旋转 90 度

### @tabler/icons-react
```js
import { IconDownload, IconPlus } from '@tabler/icons-react'
<IconDownload size={18} />
<IconPlus size={18} />
```
在找到图标后，点击组件名称即可复制。

其主要的Props有：

| Prop      | 类型                | 默认值       | 说明                     |
|-----------|---------------------|--------------|--------------------------|
| size      | number / string     | 24           | 图标大小（"1em"、20）    |
| color     | string              | currentColor | 颜色（"#ff0000"）        |
| stroke    | number              | 2            | 线条粗细（1.5、2、3）    |
| className | string              | -            | 自定义 CSS 类名          |
| style     | React.CSSProperties | -            | 内联样式                 |
| fill      | string              | none         | 填充颜色（部分图标支持） |
## Toast扩展
shadcn/ui不直接内置类似 Ant Design 的全局 message 或 notification 这样的轻量级提示组件。官方推荐使用sonner作为 Toast组件。
### 安装
```sh
npm install sonner
# 或
pnpm add sonner
```

### 根布局初始化组件
```js
import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-center" /> {/* 必须添加 */}
      </body>
    </html>
  )
}
```

### 触发Toast
```js
import { toast } from 'sonner'

function Demo() {
  return (
    <button onClick={() => toast.success('操作成功！')}>
      点击显示 Toast
    </button>
  )
}
```

### utils封装
```js
import { toast } from 'sonner'

export function showSubmittedData(
  data: unknown,
  title: string = 'You submitted the following values:'
) {
  toast.message(title, {
    description: (
      // w-[340px]
      <pre className='mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4'>
        <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
      </pre>
    ),
  })
}
```
调用：
```js
import { showSubmittedData } from '@/utils/show-submitted-data'
showSubmittedData(fileDetails, 'You have imported the following file:')
```

## 多个位置触发同一个弹窗
### 基础用法
弹窗的基础用法是通过DialogTrigger组件，将触发逻辑和弹窗放在一起，如下：
```js
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogDemo() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
```
### 多弹窗场景及解决方案
但是在实际项目中，经常是一个弹窗，需要在多个位置触发。这里就需要将弹窗与触发逻辑分离出来。比如列表里的新建、编辑弹窗。

通常我们可以通过：
- 状态提升
- Context API
- 状态管理库
来分离相应的弹窗逻辑。

### Context API 解决方案
这里以Context API及列表页面的弹窗为例。
- 在列表页面的Page组件增加页面级的Provider，将弹窗的状态与数据值及设置方法，以Context的Value传递

Page组件：
```js
import { TasksDialogs } from './components/tasks-dialogs'
import TasksProvider from './context/tasks-context'

export default function Tasks() {
  return (
    <TasksProvider>
      {/** contents */}
      <TasksDialogs />
    </TasksProvider>
  )
}
```

Context组件：
```js
import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Task } from '../data/schema'

type TasksDialogType = 'create' | 'update' | 'delete' | 'import'

interface TasksContextType {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
}

const TasksContext = React.createContext<TasksContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TasksProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  return (
    <TasksContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TasksContext>
  )
}

export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)

  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return tasksContext
}
```

- 弹窗触发位置
新建按钮：
```js
import { IconDownload, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTasks } from '../context/tasks-context'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import</span> <IconDownload size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
```

编辑菜单：
```js
import { useTasks } from '../context/tasks-context'

const task = taskSchema.parse(row.original)

const { setOpen, setCurrentRow } = useTasks()
<DropdownMenuItem
  onClick={() => {
    setCurrentRow(task)
    setOpen('update')
  }}
>
  Edit
</DropdownMenuItem>
```

- 弹窗组件
通过open属性控制
```js
import { useTasks } from '../context/tasks-context'
const { open, setOpen, currentRow, setCurrentRow } = useTasks()
<Dialog
  open={open}
  onOpenChange={(val) => {
    onOpenChange(val)
    form.reset()
  }}
>
  <DialogContent className='gap-2 sm:max-w-sm'>
    {/** Dialog Content code */}
  </DialogContent>
</Dialog>
```

## next-itnl的组合使用
- 使用NextIntlClientProvider包含整个应用
- 设置好locale及messages的属性
- 使用useTranslations及JSX语法正常使用即可。

如果遇到翻译失败，可能是因为：
- 属性名称写错
- 某语种的该内容缺失
- messages属性读取有误，缺少某个文件等。
  - 特别是在语言是根据配置生成时，可能会导致语言文件少加载。

## Form开发
### 安装
```sh
npx shadcn@latest add form
```
上面的命令会同时安装react-hookd-form、zod及@hookform/resolvers,
如果没有，可以手动安装
```sh
npm install @hookform/resolvers zod react-hook-form
```
### shadn/ui的form组件说明
shadn/ui的form: 为集成react-hook-form开发的表单组件，相应的组件有：
```md
- <Form />: 表单的容器组件，提供与 react-hook-form 的深度集成。
- <FormField />: 管理单个表单字段的上下文和验证状态。
- <FormItem />: 包裹单个字段的完整 UI 结构（标签、输入框、错误消息等）。
- <FormControl />: 包裹实际的输入组件（如 Input、Select），绑定表单的 onChange/value 等事件。
- <FormLabel />: 渲染字段的标签文本。
- <FormMessage />: 显示字段的验证错误信息。
- <FormDescription />: 表单字段提供补充说明文本
```
它们的关系如下：
```js
<Form>
  <FormField
    control={...}
    name="..."
    render={() => (
      <FormItem>
        <FormLabel />
        <FormControl>
          { /* Your form field */}
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```
### react-hook-form说明
提供useForm()来管理表单的状态，支持状态管理、验证、提交、错误处理等场景。
可以将useForm返回的值，作为props直接传给shadcn/ui的form组件。
```js
import { useForm } from 'react-hook-form'

const form = useForm({
  defaultValues: { name: '' }, // 初始化值
  mode: 'onChange'            // 验证触发模式
});


<Form {...form}>
  {/* 表单内容 */}
</Form>
```

### zod说明
用于定义各表单项的数据结构和验证规则，并自动生成Typescript的类型定义。
```js
import { z } from 'zod'
const formSchema = z.object({
  email: z.string().email('无效邮箱'), // 邮箱验证
  age: z.number().min(18, '需成年')    // 数字范围验证
});

// 自动推断类型：{ email: string; age: number }
type FormValues = z.infer<typeof formSchema>;
```

### zodResolver说明
将 Zod 的验证逻辑集成到 react-hook-form 中，自动将验证错误映射到表单错误状态
```js
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'
const formSchema = z.object({
  email: z.string().email('无效邮箱'), // 邮箱验证
  age: z.number().min(18, '需成年')    // 数字范围验证
});

const form = useForm({
  resolver: zodResolver(formSchema), // 连接Zod与RHF
  defaultValues: { ... }
});

<Form {...form}>
  {/* 表单内容 */}
</Form>
```

### Form组件开发
下面以文件上传为例，说明整个开发过程
#### 导入相关依赖
```js
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
// 表单组件，这里以Input为例
import { Input } from '@/components/ui/input'
```

#### form结构定义
如文件上传检验
```js
const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file',
    })
    .refine(
      (files) => ['text/csv'].includes(files?.[0]?.type),
      'Please upload csv format.'
    ),
})
```

#### useForm初始化
```js
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { file: undefined },
})
```

#### form注册
```js
const fileRef = form.register('file')
```

#### onSubmit逻辑书写
```js
const onSubmit = () => {
  const file = form.getValues('file')

  if (file && file[0]) {
    const fileDetails = {
      name: file[0].name,
      size: file[0].size,
      type: file[0].type,
    }
    showSubmittedData(fileDetails, 'You have imported the following file:')
  }
  onOpenChange(false)
}
```

#### Form组件书写
```js
<Form {...form}>
  <form id='task-import-form' onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name='file'
      render={() => (
        <FormItem className='mb-2 space-y-1'>
          <FormLabel>File</FormLabel>
          <FormControl>
            <Input type='file' {...fileRef} className='h-8' />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
<Button type='submit' form='task-import-form'>
  Import
</Button>
```

## 数据表格
基于 @tanstack/react-table 及 shadcn/ui的table 组件实现

### 安装
```js
npx shadcn@latest add table
npm install @tanstack/react-table
```
### shadcn/ui的table 组件说明
```
- Table: 表格容器（<table> 标签的封装）。
- TableCaption: 表格标题
- TableHeader: 表头区域（<thead> 的封装）。
- TableBody: 表体区域（<tbody> 的封装）。
- TableRow: 表格行（<tr> 的封装）。
- TableCell: 表格单元格（<td> 或 <th> 的封装）。
- TableHead: 表头单元格（<th> 的封装，用于列标题）。
```
### @tanstack/react-table使用说明
#### @tanstack/react-table 相关导入说明
**类型定义**
- ColumnDef: 定义表格列的配置类型，包括表头、单元格渲染方式、排序、过滤等。
- ColumnFiltersState: 管理列过滤状态（通常是一个数组，包含各列的过滤条件）。
- SortingState: 管理排序状态（通常是一个数组，包含排序列和排序方向）。
- VisibilityState: 管理列的显示/隐藏状态（键值对，如 { columnId: true }）。

**核心函数**
- getCoreRowModel: 生成表格的基础行模型（必须调用）。
- getFilteredRowModel: 根据过滤状态返回过滤后的行数据。
- getSortedRowModel: 根据排序状态返回排序后的行数据。
- getPaginationRowModel: 启用分页功能，返回分页后的行数据。
- getFacetedRowModel: 启用面向列的分面（Facet）功能，用于复杂过滤场景。
- getFacetedUniqueValues: 获取某列的唯一值集合（常用于生成过滤选项）。

**工具函数**
- flexRender: 动态渲染表头或单元格内容（支持自定义组件或字符串）。

**Hook**
- useReactTable: 核心 Hook，接收配置（列定义、数据、状态等），返回表格实例和方法。

#### ColumnDef属性说明
- id: 列标识，如: id: "select"
- accessorKey: 指定列关联的数据字段名（对应 data 中的属性）
- accessorFn:  用于替代 accessorKey,值类型为： (row: TData) => TValue，动态计算单元格的值（适合复杂数据转换），如组合姓名的场景
- header: 表头渲染，定义表头显示内容，支持字符串或自定义渲染函数。
- footer: 定义表尾内容（用法同 header）
- cell:  自定义单元格渲染逻辑，可访问行数据。
- enableSorting: 是否允许对该列排序（默认 true）
- sortingFn: 自定义排序逻辑（覆盖默认的字符串/数值排序）
- filterFn: 自定义过滤逻辑（覆盖默认的模糊匹配）。
- enableHiding: 是否允许用户隐藏该列（默认 true）。
- size / minSize / maxSize: 控制列宽度（像素值）。
- columns: 用于嵌套列（表头分组）
- meta: 存储任意列元数据，可在表头、单元格中访问。


#### useReactTable参数说明
**必选参数**
- data: 表格的数据源，每一行对应一个对象
- columns: 列配置数组，定义每列的显示、排序、过滤等行为
- getCoreRowModel:  生成表格的基础行模型，必须调用 getCoreRowModel(),这样在渲染行时，才可以通过 table.getRowModel() 获取渲染用的行数据。

**可选参数-状态管理相关**
- state： 表格的状态数据集合，比如排序，过滤，选中状态等。
```js
{
  sorting?: SortingState;       // 排序状态
  columnFilters?: ColumnFiltersState; // 列过滤状态
  columnVisibility?: VisibilityState; // 列可见性状态
  rowSelection?: RowSelectionState;   // 行选中状态
  // 其他状态...
}
```
- onSortingChange： 当排序状态变化时触发（如点击表头）
- onColumnFiltersChange： 当列过滤条件变化时触发（如输入过滤值）
- onColumnVisibilityChange： 当列显示/隐藏状态变化时触发。
- onRowSelectionChange： 当行选中状态变化时触发（如勾选复选框）
- initialState: 初始化表格状态（类似 state，但只在首次渲染时生效）
**可选参数-其他**
- enableRowSelection: 启用行选择功能（设置为 true 后，可通过复选框选择行）
- getFilteredRowModel: 根据过滤状态返回过滤后的行数据。
- getSortedRowModel: 根据排序状态返回排序后的行数据。
- getPaginationRowModel: 启用分页功能，返回分页后的行数据。
- getFacetedRowModel: 启用分面（Facet）功能，用于复杂过滤场景。
- getFacetedUniqueValues: 获取某列的唯一值集合（常用于生成过滤选项下拉菜单）
- debugAll: 用调试模式，打印内部状态变化。

### 数据表格开发
#### 依赖导入
```js
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
```
#### 列数据定义
```js
"use client"
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { labels, priorities, statuses } from '../data/data'
import { Task } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Task' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const label = labels.find((label) => label.value === row.original.label)

      return (
        <div className='flex space-x-2'>
          {label && <Badge variant='outline'>{label.label}</Badge>}
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('title')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center'>
          {status.icon && (
            <status.icon className='text-muted-foreground mr-2 h-4 w-4' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      )

      if (!priority) {
        return null
      }

      return (
        <div className='flex items-center'>
          {priority.icon && (
            <priority.icon className='text-muted-foreground mr-2 h-4 w-4' />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
```
#### 状态设置
```js
const [rowSelection, setRowSelection] = React.useState({})
const [columnVisibility, setColumnVisibility] =
  React.useState<VisibilityState>({})
const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
  []
)
const [sorting, setSorting] = React.useState<SortingState>([])
```
#### useReactTable调用
```js
const table = useReactTable({
  data,
  columns,
  state: {
    sorting,
    columnVisibility,
    rowSelection,
    columnFilters,
  },
  enableRowSelection: true,
  onRowSelectionChange: setRowSelection,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
})
```
### filter组件开发
#### props类型定义
将table作为props传给filter组件，对应的props类型为：
```js
import { Table } from '@tanstack/react-table'
interface DataTableToolbarProps<TData> {
  table: Table<TData>
}
```

#### 判断是否有过滤条件
判断是否有过滤条件：
```js
const isFiltered = table.getState().columnFilters.length > 0
```
#### input类型的过滤条件
获取某个过滤条件及设置某个过滤条件：
```js
// 在搜索框输入时实时过滤 title 列
<input
  placeholder="Filter titles..."
  value={table.getColumn('title')?.getFilterValue() || ''}
  onChange={(e) => 
    table.getColumn('title')?.setFilterValue(e.target.value)
  }
/>
```
上面的代码是针对title列，设置相应的过滤值及获取相应的过滤值。

#### 下拉类型的过滤条件
统计各下拉选项类型的数据有几条：
```js
const facets = column?.getFacetedUniqueValues()
```
其中column为
```js
table.getColumn('status')
```
返回的数据格式：
```js
Map {
  'done' => 2,
  'in progress' => 1,
  'todo' => 1
}
```
表示该列表数据中，done状态有2条，in progress状态有1条，todo状态有1条。可以在下拉框选择中显示

获取当前的下拉选择框的过滤状态值：
```js
const selectedValues = new Set(column?.getFilterValue() as string[])
```
选中后，设置通过setFilterValue设置相应的值：
```js
<CommandItem
  key={option.value}
  onSelect={() => {
    if (isSelected) {
      selectedValues.delete(option.value)
    } else {
      selectedValues.add(option.value)
    }
    const filterValues = Array.from(selectedValues)
    column?.setFilterValue(
      filterValues.length ? filterValues : undefined
    )
  }}
>
```
### Table组件渲染
- 通过table.getHeaderGroups()渲染表头
- 通过table.getRowModel().rows渲染表体
```js
<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => {
          return (
            <TableHead key={header.id} colSpan={header.colSpan}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </TableHead>
          )
        })}
      </TableRow>
    ))}
  </TableHeader>
  <TableBody>
    {table.getRowModel().rows?.length ? (
      table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && 'selected'}
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </TableCell>
          ))}
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell
          colSpan={columns.length}
          className='h-24 text-center'
        >
          No results.
        </TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>
```
### 分页组件开发
将table作为props传入
#### props定义
```js
import { Table } from '@tanstack/react-table'
interface DataTablePaginationProps<TData> {
  table: Table<TData>
}
```
#### 选中数据状态展示
```js
<div className='text-muted-foreground hidden flex-1 text-sm sm:block'>
  {table.getFilteredSelectedRowModel().rows.length} of{' '}
  {table.getFilteredRowModel().rows.length} row(s) selected.
</div>
```
效果：
```
2 of 42 row(s) selected.
```

#### 设置页面的数据条数
```js
table.setPageSize(Number(value))
```
#### 展示当前页面及总页面数
```js
<div className='flex w-[100px] items-center justify-center text-sm font-medium'>
  Page {table.getState().pagination.pageIndex + 1} of{' '}
  {table.getPageCount()}
</div>
```
效果：
```
Page 1 of 3
```
#### 切换页面
返回首页：
```js
table.setPageIndex(0)
// 判断是不是可以返回首页
!table.getCanPreviousPage()
```
返回上一页
```js
table.previousPage()
// 判断是否有上一页
!table.getCanPreviousPage()
```
下一页
```js
table.nextPage()
!table.getCanNextPage()
```
最后一页：
```js
table.setPageIndex(table.getPageCount() - 1)
// 判断是否有下一页
!table.getCanNextPage()
```