---
toc: content
group: 
  title: Development Scenarios
  order: 30
order: 3
---

# shadcn/ui Development Summary

## Icons Extension
Our project will use the following two libraries as extensions:
- [lucide-react](https://lucide.dev/icons/)
- [@tabler/icons-react](https://tabler.io/icons)

Among these, lucide-react has smaller volume, but fewer icon counts. @tabler/icons-react has more icons, nearly 6000.
Both libraries support on-demand loading, so using both is fine. During build, only imported icon icons will be bundled.

Here are the usage methods for both:

### lucide-react
```js
import { Camera, Heart } from "lucide-react";

<Camera />
<Heart />
```
After finding the icon, directly click the Copy JSX button, which is the component code.

Its main props are:

| Prop                | Type                | Default       | Description                                       |
|---------------------|---------------------|---------------|---------------------------------------------------|
| size                | number / string     | 24            | Icon size ("1em", 20)                            |
| color               | string              | currentColor  | Color ("#ff0000")                                |
| strokeWidth         | number              | 2             | Line thickness (1.5, 2, 3)                      |
| absoluteStrokeWidth | boolean             | false         | Whether to force use strokeWidth (unaffected by size) |
| className           | string              | -             | Custom CSS class name                            |
| style               | React.CSSProperties | -             | Inline styles                                    |

Project example:
```js
<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
```
- ml-auto - Set left margin auto (margin-left: auto), align element to the right
- transition-transform - Specify transform property should have transition effect
- duration-200 - Set transition duration to 200ms
- group-data-[state=open]/collapsible:rotate-90 - This is a complex custom class, broken down as follows:
  - group - Allows child elements to set styles based on parent element state
  - data-[state=open] - Apply when parent element has data-state="open" attribute
  - /collapsible - Scope limitation, only effective for components with collapsible class
  - :rotate-90 - When above conditions are met, element rotates 90 degrees

### @tabler/icons-react
```js
import { IconDownload, IconPlus } from '@tabler/icons-react'
<IconDownload size={18} />
<IconPlus size={18} />
```
After finding the icon, click the component name to copy.

Its main Props are:

| Prop      | Type                | Default       | Description                     |
|-----------|---------------------|---------------|--------------------------------|
| size      | number / string     | 24            | Icon size ("1em", 20)          |
| color     | string              | currentColor  | Color ("#ff0000")              |
| stroke    | number              | 2             | Line thickness (1.5, 2, 3)    |
| className | string              | -             | Custom CSS class name          |
| style     | React.CSSProperties | -             | Inline styles                  |
| fill      | string              | none          | Fill color (some icons support) |

## Toast Extension
shadcn/ui doesn't directly include lightweight prompt components like Ant Design's global message or notification. Official recommendation is to use sonner as Toast component.

### Installation
```sh
npm install sonner
# or
pnpm add sonner
```

### Root Layout Initialize Component
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
        <Toaster position="top-center" /> {/* Must add */}
      </body>
    </html>
  )
}
```

### Trigger Toast
```js
import { toast } from 'sonner'

function Demo() {
  return (
    <button onClick={() => toast.success('Operation successful!')}>
      Click to show Toast
    </button>
  )
}
```

### utils Encapsulation
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
Call:
```js
import { showSubmittedData } from '@/utils/show-submitted-data'
showSubmittedData(fileDetails, 'You have imported the following file:')
```

## Multiple Positions Trigger Same Modal
### Basic Usage
Modal's basic usage is through DialogTrigger component, putting trigger logic and modal together:
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

### Multi-modal Scenarios and Solutions
But in actual projects, often one modal needs to be triggered from multiple positions. Here need to separate modal from trigger logic. Such as create, edit modals in lists.

Usually we can separate corresponding modal logic through:
- State lifting
- Context API
- State management libraries

### Context API Solution
Here using Context API and list page modal as example.
- Add page-level Provider in list page's Page component, pass modal state, data values, and set methods as Context Value

Page component:
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

Context component:
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

- Modal trigger positions
Create button:
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

Edit menu:
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

- Modal component
Controlled through open property
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

## next-intl Combined Usage
- Use NextIntlClientProvider to wrap entire application
- Set locale and messages properties
- Use useTranslations and JSX syntax normally

If translation fails, may be because:
- Property name written incorrectly
- Missing content for certain language
- messages property read incorrectly, missing some files, etc.
  - Especially when language is generated based on configuration, may cause language files to be underloaded

## Form Development
### Installation
```sh
npx shadcn@latest add form
```
Above command will simultaneously install react-hook-form, zod, and @hookform/resolvers.
If not, can manually install:
```sh
npm install @hookform/resolvers zod react-hook-form
```

### shadcn/ui Form Component Description
shadcn/ui form: Form components developed for integrating react-hook-form, corresponding components include:
```md
- <Form />: Form container component, provides deep integration with react-hook-form
- <FormField />: Manages single form field context and validation state
- <FormItem />: Wraps complete UI structure for single field (label, input, error message, etc.)
- <FormControl />: Wraps actual input components (like Input, Select), binds form onChange/value events
- <FormLabel />: Renders field label text
- <FormMessage />: Displays field validation error messages
- <FormDescription />: Provides supplementary description text for form fields
```

Their relationship:
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

### react-hook-form Description
Provides useForm() to manage form state, supports state management, validation, submission, error handling scenarios.
Can pass useForm returned values directly as props to shadcn/ui form components.
```js
import { useForm } from 'react-hook-form'

const form = useForm({
  defaultValues: { name: '' }, // Initial values
  mode: 'onChange'            // Validation trigger mode
});

<Form {...form}>
  {/* Form content */}
</Form>
```

### zod Description
Used to define data structure and validation rules for form items, automatically generates TypeScript type definitions.
```js
import { z } from 'zod'
const formSchema = z.object({
  email: z.string().email('Invalid email'), // Email validation
  age: z.number().min(18, 'Must be adult')    // Number range validation
});

// Auto-infer type: { email: string; age: number }
type FormValues = z.infer<typeof formSchema>;
```

### zodResolver Description
Integrates Zod validation logic into react-hook-form, automatically maps validation errors to form error state
```js
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'
const formSchema = z.object({
  email: z.string().email('Invalid email'), // Email validation
  age: z.number().min(18, 'Must be adult')    // Number range validation
});

const form = useForm({
  resolver: zodResolver(formSchema), // Connect Zod with RHF
  defaultValues: { ... }
});

<Form {...form}>
  {/* Form content */}
</Form>
```

### Form Component Development
Below using file upload as example, explaining entire development process

#### Import Related Dependencies
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
// Form components, here using Input as example
import { Input } from '@/components/ui/input'
```

#### Form Structure Definition
Like file upload validation
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

#### useForm Initialization
```js
const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: { file: undefined },
})
```

#### Form Registration
```js
const fileRef = form.register('file')
```

#### onSubmit Logic Writing
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

#### Form Component Writing
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

## Data Tables
Implemented based on @tanstack/react-table and shadcn/ui table components

### Installation
```js
npx shadcn@latest add table
npm install @tanstack/react-table
```

### shadcn/ui Table Component Description
```
- Table: Table container (encapsulation of <table> tag)
- TableCaption: Table caption
- TableHeader: Table header area (encapsulation of <thead>)
- TableBody: Table body area (encapsulation of <tbody>)
- TableRow: Table row (encapsulation of <tr>)
- TableCell: Table cell (encapsulation of <td> or <th>)
- TableHead: Table header cell (encapsulation of <th>, used for column titles)
```

### @tanstack/react-table Usage Description
#### @tanstack/react-table Related Import Description
**Type Definitions**
- ColumnDef: Define table column configuration type, including header, cell rendering method, sorting, filtering, etc.
- ColumnFiltersState: Manage column filter state (usually an array containing filter conditions for each column)
- SortingState: Manage sorting state (usually an array containing sort column and sort direction)
- VisibilityState: Manage column show/hide state (key-value pairs, like { columnId: true })

**Core Functions**
- getCoreRowModel: Generate table's basic row model (must call)
- getFilteredRowModel: Return filtered row data based on filter state
- getSortedRowModel: Return sorted row data based on sort state
- getPaginationRowModel: Enable pagination functionality, return paginated row data
- getFacetedRowModel: Enable column-oriented facet functionality for complex filtering scenarios
- getFacetedUniqueValues: Get unique value set for a column (commonly used for generating filter options)

**Utility Functions**
- flexRender: Dynamically render header or cell content (supports custom components or strings)

**Hook**
- useReactTable: Core Hook, receives configuration (column definitions, data, state, etc.), returns table instance and methods

#### ColumnDef Property Description
- id: Column identifier, like: id: "select"
- accessorKey: Specify column associated data field name (corresponds to property in data)
- accessorFn: Used to replace accessorKey, value type: (row: TData) => TValue, dynamically calculate cell value (suitable for complex data transformation), like combining name scenarios
- header: Header rendering, define header display content, supports string or custom rendering function
- footer: Define footer content (usage same as header)
- cell: Custom cell rendering logic, can access row data
- enableSorting: Whether to allow sorting for this column (default true)
- sortingFn: Custom sorting logic (overrides default string/number sorting)
- filterFn: Custom filtering logic (overrides default fuzzy matching)
- enableHiding: Whether to allow users to hide this column (default true)
- size / minSize / maxSize: Control column width (pixel values)
- columns: Used for nested columns (header grouping)
- meta: Store arbitrary column metadata, accessible in header, cells

#### useReactTable Parameter Description
**Required Parameters**
- data: Table data source, each row corresponds to an object
- columns: Column configuration array, define display, sorting, filtering behavior for each column
- getCoreRowModel: Generate table's basic row model, must call getCoreRowModel(), so when rendering rows, can get rendering row data through table.getRowModel()

**Optional Parameters - State Management Related**
- state: Table state data collection, like sorting, filtering, selection state, etc.
```js
{
  sorting?: SortingState;       // Sort state
  columnFilters?: ColumnFiltersState; // Column filter state
  columnVisibility?: VisibilityState; // Column visibility state
  rowSelection?: RowSelectionState;   // Row selection state
  // Other states...
}
```
- onSortingChange: Triggered when sort state changes (like clicking header)
- onColumnFiltersChange: Triggered when column filter conditions change (like inputting filter value)
- onColumnVisibilityChange: Triggered when column show/hide state changes
- onRowSelectionChange: Triggered when row selection state changes (like checking checkbox)
- initialState: Initialize table state (similar to state, but only effective on first render)

**Optional Parameters - Others**
- enableRowSelection: Enable row selection functionality (set to true, can select rows through checkboxes)
- getFilteredRowModel: Return filtered row data based on filter state
- getSortedRowModel: Return sorted row data based on sort state
- getPaginationRowModel: Enable pagination functionality, return paginated row data
- getFacetedRowModel: Enable facet functionality for complex filtering scenarios
- getFacetedUniqueValues: Get unique value set for a column (commonly used for generating filter option dropdown menus)
- debugAll: Use debug mode, print internal state changes

### Data Table Development
#### Dependency Import
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

#### Column Data Definition
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

#### State Setting
```js
const [rowSelection, setRowSelection] = React.useState({})
const [columnVisibility, setColumnVisibility] =
  React.useState<VisibilityState>({})
const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
  []
)
const [sorting, setSorting] = React.useState<SortingState>([])
```

#### useReactTable Call
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

### Filter Component Development
#### Props Type Definition
Pass table as props to filter component, corresponding props type:
```js
import { Table } from '@tanstack/react-table'
interface DataTableToolbarProps<TData> {
  table: Table<TData>
}
```

#### Judge Whether Has Filter Conditions
Judge whether has filter conditions:
```js
const isFiltered = table.getState().columnFilters.length > 0
```

#### Input Type Filter Conditions
Get certain filter condition and set certain filter condition:
```js
// Real-time filter title column when typing in search box
<input
  placeholder="Filter titles..."
  value={table.getColumn('title')?.getFilterValue() || ''}
  onChange={(e) => 
    table.getColumn('title')?.setFilterValue(e.target.value)
  }
/>
```
Above code is for title column, set corresponding filter value and get corresponding filter value.

#### Dropdown Type Filter Conditions
Count how many data items each dropdown option type has:
```js
const facets = column?.getFacetedUniqueValues()
```
Where column is
```js
table.getColumn('status')
```
Returned data format:
```js
Map {
  'done' => 2,
  'in progress' => 1,
  'todo' => 1
}
```
Indicates in this list data, done status has 2 items, in progress status has 1 item, todo status has 1 item. Can display in dropdown selection

Get current dropdown selection box filter state value:
```js
const selectedValues = new Set(column?.getFilterValue() as string[])
```
After selection, set corresponding value through setFilterValue:
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

### Table Component Rendering
- Render header through table.getHeaderGroups()
- Render body through table.getRowModel().rows
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

### Pagination Component Development
Pass table as props
#### Props Definition
```js
import { Table } from '@tanstack/react-table'
interface DataTablePaginationProps<TData> {
  table: Table<TData>
}
```

#### Selected Data State Display
```js
<div className='text-muted-foreground hidden flex-1 text-sm sm:block'>
  {table.getFilteredSelectedRowModel().rows.length} of{' '}
  {table.getFilteredRowModel().rows.length} row(s) selected.
</div>
```
Effect:
```
2 of 42 row(s) selected.
```

#### Set Page Data Count
```js
table.setPageSize(Number(value))
```

#### Display Current Page and Total Pages
```js
<div className='flex w-[100px] items-center justify-center text-sm font-medium'>
  Page {table.getState().pagination.pageIndex + 1} of{' '}
  {table.getPageCount()}
</div>
```
Effect:
```
Page 1 of 3
```

#### Switch Pages
Return to first page:
```js
table.setPageIndex(0)
// Judge if can return to first page
!table.getCanPreviousPage()
```
Previous page:
```js
table.previousPage()
// Judge if has previous page
!table.getCanPreviousPage()
```
Next page:
```js
table.nextPage()
!table.getCanNextPage()
```
Last page:
```js
table.setPageIndex(table.getPageCount() - 1)
// Judge if has next page
!table.getCanNextPage()
```
