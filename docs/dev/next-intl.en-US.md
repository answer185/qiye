---
toc: content
group: 
  title: React Development
  order: 3
order: 1
---
# NextJS Project Internationalization Solution

## Technology Selection
According to official documentation recommendations, internationalization options include:
- next-intl
- next-international
- next-i18n-router
- paraglide-next
- lingui

Among these, next-intl is deeply integrated with Next.js and can be the project's first choice. next-international has a simpler API, and if it's a small project, it can be considered. Here's a specific comparison:

| Library                 | Route i18n | Static Generation Support | Type Safety | Translation Management | Markdown Friendly | Learning Curve |
|------------------------|-------------|---------------------------|-------------|----------------------|-------------------|----------------|
| next-intl              | ✅           | ✅                        | ✅           | JSON                 | ✅                 | Medium         |
| next-international     | ✅           | ✅                        | ✅           | TS/JSON              | ⚠️ (needs adaptation) | Low            |
| next-i18n-router       | ✅           | ⚠️ (manual)               | ❌           | None                 | ❌                 | Low            |
| Paraglide              | ❌           | ✅                        | ✅           | IDE Plugin           | ❌                 | High           |
| Lingui                 | ⚠️ (needs config) | ✅                        | ⚠️           | PO Files             | ⚠️ (needs conversion) | Medium         |

## Project Scenario Assumption
Here we assume our project is a multilingual information site, with content mainly about humanoid robot information.
The project has multiple modules: homepage, company introduction, robot product introduction, industry news, etc.
In the top right corner of the website, we want a multilingual switching menu.
The first path in the URL is the corresponding language identifier, such as en, zh, etc.

## next-intl Usage
### Installation
```shell
npm install next-intl
```

### Development
#### Dynamic Routing
All routing files under the app directory use [locale] to wrap, of course, [lang] or other parameters can also be used to represent the current language.

**Language Files**
The official documentation directory is messages, with one .json file for each language. This form is not mandatory. In fact, when the project is complex, this solution is troublesome to maintain.
In this project, we place language files in the src/intl directory, with one folder for each language. And split content by modules, the structure might be as follows:
- common.json: Basic website content files, such as home, about-us, company, etc. menu names.
- page-***.json: Content specific to each page
- Other language files, such as:
  - glossary.json: Terminology content
  - tooltip.json: Tooltip prompts
  - table.json: Public table components

The above is just a reference, split according to actual project specifications.

Here we assume there are en and zh languages, with two language files. The corresponding file paths are src/intl/en and src/intl/zh

common.json: Menu and other content
```json
{
  "about-us": "About us",
  "home": "Home"
}
```

page-home.json: Homepage title content
```json
{
  "title": "Humanoid Robot Information",
  "sub-title": "Here's everything you need to know about humanoid robots"
}
```

Chinese content:
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

**next.config.ts Plugin Initialization**
Load next-intl plugin in next.config.ts
```js
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
```

createNextIntlPlugin will read the configuration in src/i18n/request.ts file. This configuration exports a function that gets the corresponding language file configuration based on the language parameter in the request.
If you want to modify this file path, you can pass the corresponding configuration during initialization:
```js
const withNextIntl = createNextIntlPlugin(
  // Specify a custom path here
  './somewhere/else/request.ts'
);
```

#### Routing Configuration
The default configuration path is: src/i18n/routing.ts, use next-intl/routing's defineRouting to configure supported languages and default language.
A simple version code is as follows:
```js
import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'de'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
```

In actual projects, we need to consider extensibility, so we need to make locales and defaultLocale constant and configurable.
- DEFAULT_LOCALE: Default language
- LOCALES_CODES: Supported languages

LOCALES_CODES can be considered to be set in .env configuration file, or parsed from the top right language component configuration file.
The corresponding constant file is: src/lib/constants.ts
```js
import i18nConfig from "../../i18n.config.json"

export const DEFAULT_LOCALE = "en"
const BUILD_LOCALES = process.env.NEXT_PUBLIC_BUILD_LOCALES
export const LOCALES_CODES = BUILD_LOCALES
  ? BUILD_LOCALES.split(",")
  : i18nConfig.map(({ code }) => code)
```

Code in .env:
```
NEXT_PUBLIC_BUILD_LOCALES=en,zh
```
If not configured, it will use i18n.config.json in the root directory:
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

Modified routing.ts:
```js
import { defineRouting } from "next-intl/routing"

import { DEFAULT_LOCALE, LOCALES_CODES } from "@/lib/constants"

export const routing = defineRouting({
  locales: LOCALES_CODES,
  defaultLocale: DEFAULT_LOCALE,
  localeCookie: false,
})
```

Create src/i18n/navigation.ts, set up navigation API:
```js
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';
 
// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

If using version 3.x, the navigation.ts code is written directly in routing.ts.

**Middleware Configuration**
Mainly used to configure route redirects, such as:
- / redirects to /en
- /pathnames redirects to /en/pathnames

The corresponding file is: src/middleware.ts
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

For / redirecting to /en default language, we also need to do redirect in app/page.tsx:
```js
import { redirect } from "next/navigation"
import { routing } from "@/i18n/routing"

export default function Page() {
  redirect(routing.defaultLocale)
}
```

#### Read Language Files Based on Request
The corresponding configuration file is src/i18n/request.ts
This file needs to export a getRequestConfig function that returns configuration for reading corresponding language content based on the incoming requestLocale parameter.
Considering extensibility, we need to automatically load all .json files under the corresponding language package to automatically recognize newly added files later.
We also need to read default language files simultaneously and merge them to avoid missing content.

Here's the loadMessage.ts code:
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

request.ts code:
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

#### Provider Setup
Generally set in the global layout, corresponding path: src/app/[locale]/layout.tsx
next-intl provides NextIntlClientProvider to wrap layout's children.
The locale in request can be obtained through params parameter.
In actual projects, we also need to consider:
- html lang attribute setting
- project static rendering
- NextIntlClientProvider component's locale and messages properties
- 404 display when locale doesn't exist
- set timezone based on language

Here's the specific code implementation:

**rootLayout**
Because we need layout for [locale] and global 404 page, we need rootLayout, which simply returns corresponding child elements.
src/app/layout.tsx:
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
Corresponding file src/app/layout.tsx:
Here we need to consider the following aspects:
- Intercept unsupported language parameters and redirect to 404 page.
- Use setRequestLocale to set language environment for static rendering.
- Use NextIntlClientProvider component to wrap children. For older versions, locale and messages props also need to be set. New versions can inherit automatically.

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

For older versions' locale and messages settings, they can be obtained through getMessages method:
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

Usually for projects, there's more than one global provider, such as theme-related, other component internationalization, etc. To improve maintainability, provider logic can be extracted into a separate component.
src/app/[locale]/providers.tsx

### Component Usage
Use useTranslations hook to get corresponding language content.
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

### Language Switching Component
This component is similar to usual business component development. Its main logic is as follows:
- Use the selected component library's Button or plain text to display the current language.
- Click event handling, after clicking, pop up language selection window
- When clicking the corresponding language, switch to the corresponding language.

Main logic code:
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
    // Callback to close language selection popup
    onClose({
      eventAction: "Locale chosen",
      eventName: currentValue,
    })
}

// Current language, for display
const locale = useLocale()

return (
<>
    <span className="hidden lg:inline-block">
        {t("common:languages")}&nbsp;
    </span>
    {locale!.toUpperCase()}
<>)
```

## Summary
Although the above content considers many details in project development, it's not everything. For example:
- When loading language files, we also need to consider file loading failure situations
- Placing language files in src/intl is not mandatory
- Language file splitting by modules needs to be adjusted according to actual project situations
- Language configuration format and priority can be adjusted or omitted according to actual situations
