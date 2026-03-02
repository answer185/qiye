---
toc: content
group: 
  title: React开发
  order: 3
order: 1
---
# NextJS项目的国际化方案
## 技术选型
根据官方文档推荐，国际化的选择方案有：
- next-intl
- next-international
- next-i18n-router
- paraglide-next
- lingui
其中next-intl是与nextjs深度集成的，可以作为项目的首选。next-international的api更简单，如果是小项目，可以考虑使用。以下是具体的对比：

| 库                 | 路由国际化  | 静态生成支持 | 类型安全 | 翻译管理 | Markdown 友好性 | 学习曲线 |
|--------------------|-------------|--------------|----------|----------|-----------------|----------|
| next-intl          | ✅           | ✅            | ✅        | JSON     | ✅               | 中       |
| next-international | ✅           | ✅            | ✅        | TS/JSON  | ⚠️（需适配）     | 低       |
| next-i18n-router   | ✅           | ⚠️（需手动）  | ❌        | 无       | ❌               | 低       |
| Paraglide          | ❌           | ✅            | ✅        | IDE 插件 | ❌               | 高       |
| Lingui             | ⚠️（需配置） | ✅            | ⚠️        | PO 文件  | ⚠️（需转换）     |          |

## 项目场景假设
这里假设我们的项目是一个多语言的资讯站点，内容主要是关于人形机器人的信息。
项目有多个模块，有首页，企业介绍、机器人产品介绍、行业资讯等模块。
在网站的右上角，我们希望有一个多语言切换的菜单。
在url的第一个path是对应的语言标识，如en、zh等。
## next-intl的使用
### 安装
```shell
npm install next-intl
```
### 开发
#### 动态路由
app目录下的所有路由文件使用[locale]包含，当然，也可以使用[lang]等其他参数，用于表示当前的语种。
语言文件
官方文档上的目录是messages，然后每种语言一个.json文件。 这个形式并不是必须的，实际上当项目复杂时，这个方案维护起来很麻烦。
这个项目里，我们把语言文件放置在src/intl目录下，每个语言一个文件夹。并对内容根据模块进行拆分，其结构可能如下：
- common.json: 网站的基础内容文件，如home, about-us,company等菜单名称。
- page-***.json: 每个页面特有的内容
- 其他语言文件，如：
  - glossary.json: 术语内容
  - tooltip.json: tooltip提示
  - table.json: 公共表格组件的
以上只是参考，根据实际的项目规范拆分即可。

这里假设有en和zh两种语言，并两个语言文件。对应的文件路径为src/intl/en及src/intl/zh
common.json：菜单等的内容
```json
{
  "about-us": "About us",
  "home": "Home"
}
```
page-home.json：首页的标题的内容
```json
{
  "title": "Humanoid Robot Information",
  "sub-title": "Here's everything you need to know about humanoid robots"
}
```

中文内容：
```json
{
  "about-us": "关于我们",
  "home": "首页"
}
```
```json
{
  "title": "人形机器人信息",
  "sub-title": "这里有关于人形机器人的一切信息"
}
```
next.config.ts插件初始化
在next.config.ts中加载next-intl的插件
```js
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
```

createNextIntlPlugin会读取src/i18n/request.ts 文件里的配置。这个配置会导出一个根据请求里的语言参数获取相应语言文件配置的函数。
如果要修改这个文件的路径，可以在初始化时传入相应的配置
```js
const withNextIntl = createNextIntlPlugin(
  // Specify a custom path here
  './somewhere/else/request.ts'
);
```
#### 路由配置
默认的配置路径是：src/i18n/routing.ts， 使用next-intl/routing的defineRouting配置支持的语言及默认的语言。
一个简易的版本代码如下：
```js
import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'de'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
```
实际项目中，我们需要考虑扩展性，所以需要将locales和defaultLocale常量化和配置化。
- DEFAULT_LOCALE： 默认的语言
- LOCALES_CODES：支持的语种
LOCALES_CODES，可以考虑在.env的配置文件里设置，也可以从右上角语言组件的配置文件里解析。
对应的常量文件是：src/lib/constants.ts
```js
import i18nConfig from "../../i18n.config.json"

export const DEFAULT_LOCALE = "en"
const BUILD_LOCALES = process.env.NEXT_PUBLIC_BUILD_LOCALES
export const LOCALES_CODES = BUILD_LOCALES
  ? BUILD_LOCALES.split(",")
  : i18nConfig.map(({ code }) => code)
```
.env里的代码
```
EXT_PUBLIC_BUILD_LOCALES=en,zh
```
如果不配置，将走根目录下的i18n.config.json
```json
[
  {
    "code": "en",
    "crowdinCode": "en",
    "name": "English",
    "localName": "English",
    "langDir": "ltr",
    "dateFormat": "MM/DD/YYYY"
  },
  {
    "code": "zh",
    "crowdinCode": "zh-CN",
    "name": "Chinese Simplified",
    "localName": "简体中文",
    "langDir": "ltr",
    "dateFormat": "YYYY-MM-DD"
  }
]
```
修改后的routing.ts
```js
import { defineRouting } from "next-intl/routing"

import { DEFAULT_LOCALE, LOCALES_CODES } from "@/lib/constants"

export const routing = defineRouting({
  locales: LOCALES_CODES,
  defaultLocale: DEFAULT_LOCALE,
  localeCookie: false,
})
```
创建src/i18n/navigation.ts，设置导航的API
```js
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';
 
// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```
如果使用3.x的版本，navigation.ts的代码是直接写在routing.ts中

中间件配置
主要用于配置路由的跳转，如：
- / 跳转到/en
- /pathnames 跳转到/en/pathnames
对应的文件为：src/middleware.ts
```js
import createMiddleware from "next-intl/middleware"

import { routing } from "./i18n/routing"

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
```
对/跳转到/en 默认语种还需要在app/page.tsx里做跳转：
```js
import { redirect } from "next/navigation"
import { routing } from "@/i18n/routing"

export default function Page() {
  redirect(routing.defaultLocale)
}
```

#### 根据request读取语言文件
对应的配置文件是src/i18n/request.ts
该文件需要导出一个getRequestConfig函数，返回根据传入的requestLocale参数读取相应语言内容的配置。
考虑扩展性，我们需要自动加载相应语言包下的所有.json文件，以自动识别后续新增加的文件。
还需要同时读取默认语言的文件，并做合并，避免某些内容缺失。
以下是loadMessage.ts的代码：
```js
import fs from "fs"
import path from "path"

function getNamespaces(localePath: string): string[] {
  return fs
    .readdirSync(localePath)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", ""))
}

const messagesCache: Record<string, Record<string, string>> = {}

export async function loadMessages(locale: string) {
  if (messagesCache[locale]) {
    return messagesCache[locale]
  }

  const intlPath = path.join(process.cwd(), "src/intl")
  const messages: Record<string, string> = {}

  const localePath = path.join(intlPath, locale)
  if (fs.statSync(localePath).isDirectory()) {
    const namespaces = getNamespaces(localePath)

    for (const ns of namespaces) {
      messages[ns] = (await import(`../intl/${locale}/${ns}.json`)).default
    }
  }

  messagesCache[locale] = messages
  return messages
}
```

request.ts的代码：
```js
import merge from "lodash.merge"
import { getRequestConfig } from "next-intl/server"

import { Lang } from "@/lib/types"

import { loadMessages } from "./loadMessages"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale

  // Ensure that the incoming locale is valid
  if (!locale || !routing.locales.includes(locale as Lang)) {
    locale = routing.defaultLocale
  }

  const allLocaleMessages = await loadMessages(locale)
  const allDefaultMessages = await loadMessages(routing.defaultLocale)
  const messages = merge({}, allDefaultMessages, allLocaleMessages)

  return {
    locale,
    messages,
    onError: () => {
      // Suppress errors by default, enable if needed to debug
      // console.error(error)
    },
    getMessageFallback: ({ key }) => {
      const keyOnly = key.split(".").pop()
      return keyOnly || key
    },
  }
})
```
#### Provider设置
一般在全局的layout中设置，对应的路径为：src/app/[locale]/layout.tsx
next-intl提供了NextIntlClientProvider，用于包含layout的childeren。
request里的locale可以通过params参数获取。
在实际项目中还需要考虑：
- html的lang属性设置
- 项目的静态渲染
- NextIntlClientProvider组件的locale及messages属性
- local不存在时的404显示
- 根据语种设置时区
以下是具体的代码实现：
**rootLayout**
因为我们需要有针对[locale]做layout及全局404页面，所以需要有rootlayout，这里只要简单地返回相应的子元素即可。
src/app/layout.tsx
```js
import { ReactNode } from "react"

import "@/styles/global.css"

type Props = {
  children: ReactNode
}

// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children
}
```

**localeLayout**
对应文件src/app/layout.tsx:
这里需要考虑以下方面：
- 拦截不支持的语言参数，跳转到404页面。
- 使用setRequestLocale设置语言环境，用于静态渲染。
- 使用NextIntlClientProvider组件包含children，如果是旧版本，还需要设置locale和messages的props，新版本可以自动继承
```js
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import { setRequestLocale, getMessages } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { notFound } from "next/navigation"

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  if (!routing.locales.includes(locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```
对于旧版本的local及messages的设置，可以通过getMessages方法获取
```js
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import { setRequestLocale, getMessages } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { notFound } from "next/navigation"

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  if (!routing.locales.includes(locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const messages = await getMessages({ locale })

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```
通常对项目来说，全局的provider不止一个，比如可能有关于主题的，有其他组件的国际化等。为了提高可维护性，可以抽离provider的逻辑，成为一个单独的组件。
src/app/[locale]/providers.tsx


### 组件中使用
使用useTranslations的hooks来获取相应的语言内容。
```js
import {useTranslations} from 'next-intl';
 
export default function HomePage() {
  const t = useTranslations('page-home');
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('sub-title')}</p>
    </div>
  );
}
```

### 语言切换组件
该组件与通常的业务组件开发类似，其主要逻辑如下：
- 使用所选组件库的Button或普通文本来显示当前的语言。
- 点击事件处理，点击后，弹出语言选择窗口
- 当点击相应语言后，切换相应的语种。
其主要的逻辑代码：
```js
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"
import { useParams } from "next/navigation"

const pathname = usePathname()
const { push } = useRouter()
const params = useParams()
  
const handleLocaleChange = (currentValue: string) => {
    push(
      { pathname, params },
      {
        locale: currentValue,
      }
    )
    // 关闭语言选择弹窗的回调
    onClose({
      eventAction: "Locale chosen",
      eventName: currentValue,
    })
}

// 当前语种,用于显示
const locale = useLocale()

return (
<>
    <span className="hidden lg:inline-block">
        {t("common:languages")}&nbsp;
    </span>
    {locale!.toUpperCase()}
<>
)
```
## 总结
上面的内容虽然考虑了项目开发里的不少细节，但并不是全部。比如：
- 语言文件加载时，还需要考虑文件加载失败的情况
- src/intl存放各语种的文件并不是必须的。
- 语言文件按模块拆分需要根据实际项目情况调整。
- 语言配置的格式及优先级可以根据实际情况调整或省略。


