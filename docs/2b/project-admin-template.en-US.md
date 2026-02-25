---
toc: content
group: 
  title: Project Experience
  order: 1
order: 1
---

# Admin Template

## Project Description

### What is this project
This is an out-of-the-box frontend project for middle and back office systems, used to quickly build web projects for middle and back office applications. It includes:

- Dashboard pages
- List pages
- Form pages
- Detail pages
- User modules
- System settings
- Result pages and error pages

And other common pages and modules.

It also has internationalization features.

- [Project Repository](https://github.com/answer185/nextjs-admin-template)
- [Demo Site](https://admin-template.zengcreates.cn/zh/dashboard)

### Why create this project
After using NextJS + shadcn-ui + TailwindCSS for projects, I felt that both project performance and development efficiency were greatly improved. To facilitate future use of this technology stack for projects, I first built a template and created DEMOs for typical scenarios.
It also serves as a demonstration project for job applications.

## Technology Stack

### React + TypeScript
TypeScript can detect code errors during coding, making the refactoring process less painful, and can significantly improve the auto-completion functionality of Integrated Development Environments (IDEs), providing built-in documentation for new developers in the team. Additionally, when combined with powerful AI code assistance tools, it performs even better when handling typed code.

### NextJS
Next.js is like a "Swiss Army knife" for React development, with comprehensive features and excellent performance. The latest version now supports React 19, integrates routing and API management functions, and has built-in performance optimization mechanisms.

### UI Components
Using Tailwind CSS + shadcn/ui combination to create powerful custom components.
- AI tools can also accurately generate Tailwind classes
- shadcn/ui provides out-of-the-box accessible components while optimizing code bundle size. This way, you can quickly prototype and iterate while maintaining design consistency.

### Client-side State Management
Using Zustand as the state management choice because:
- Very little boilerplate code
- Extremely small code bundle
- Simple yet powerful API
- Easy to get started

For some cross-component state management, Context is still used.

### Form Handling
Using React Hook Form + Zod solution. Both have small code bundles and intuitive, easy-to-understand API designs. When combined, they can easily implement most form development scenarios.

### Hosting Service
The combination of Vercel and React is perfect. Additionally, with the help of a global Content Delivery Network (CDN), your application can load quickly anywhere.
Application deployment is also very convenient, requiring no complex operations.
Current project address: [Click to Visit](https://admin-template.zengcreates.cn/zh/dashboard)

## Engineering

### Initialization
The project initialization is implemented using create-next-app. During the installation process, the following features were selected:
- TypeScript
- TailwindCSS
- ESLint

Initial dependencies are as follows:
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

### Engineering Improvements
NextJS has already considered many aspects of project engineering, mainly encapsulated in the eslint-config-next plugin, so only the following additions are needed:

#### Prettier
Install prettier to enhance code standardization. Related dependencies:
- prettier
- prettier-plugin-tailwindcss: Sort TailwindCSS classes
- @trivago/prettier-plugin-sort-imports: Sort import statements

#### ESLint Rule Additions
Related dependencies:
- eslint-config-prettier: For prettier, disable conflicting rules
- eslint-plugin-unused-imports: Detect and automatically remove unused imports (more accurate than ESLint's native no-unused-vars), reducing code redundancy.

#### Development Environment Configuration
Mainly configure .env.local to simply distinguish between local and production environments.

#### Directory Standards
All code is placed under src, including App routing:
- src/app: App routing
- src/intl: Multi-language settings
- src/libs: Internal system libraries
  - types.ts: Internal system data types
  - constants.ts: Internal system constants
- src/layouts: Components and related logic for layouts
- src/components: Business components
- src/styles: CSS-related content

## Frontend Architecture

### Internationalization
Using next-intl as the solution. Related directories and files:
- src/intl stores language files, currently supporting zh and en
- src/i18n stores files used by next-intl, routing, navigation, and request configuration
- app/[locale] for intercepting multiple languages
- next.config.ts configured to use next-intl plugin
- src/middleware.ts, set up corresponding middleware redirects
- src/app/page.tsx: Redirect to default route

### Component Library - shadcn/ui
Using shadcn/ui and TailwindCSS to pursue high performance and high customization characteristics.

### Routing
Using App routing, adding [locale] parent directory to intercept corresponding languages. Will include various routing applications:
- Dynamic routing: [locale]
- Regular routing: dashboard, login, etc.
- Nested routing: such as result/fail
- Route groups: such as (admin-pages), (full-width-pages)
- Parallel routing: dashboard page
- Intercepting routing: list page intercepts create page

### Layout
Group routes based on whether they are back office pages:
- (admin): Back office pages
- (full-width-layout): Non-back office pages, such as login

Specific layout file descriptions:
- app/layout.tsx: Simple forwarding, children, global HTML not configured here
- app/[locale]/layout.tsx: HTML and body tags, and loading system Providers component
- app/[locale]/(full-width-pages)/layout.tsx: Globally displayed pages
- app/[locale]/(admin-pages)/layout.tsx: Admin back office page layout, with left menu, header, footer, etc.

### Global Provider
Mainly includes:
- I18nProvider: Internationalization Provider
- ThemeProvider: Theme Provider
- TooltipProvider: Tooltip Provider

### Global CSS
Mainly sets CSS for two theme styles, corresponding file: styles/global.css

### Data Processing
- Use lodash.merge style lodash function library for processing, install corresponding lodash functions as needed.
