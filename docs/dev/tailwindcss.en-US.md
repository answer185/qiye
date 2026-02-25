---
toc: content
group: 
  title: React Development
  order: 3
order: 3
---
# Tailwind CSS Usage

## I. Introduction
### 1.1 Atomic CSS
Each Tailwind class contains one CSS feature, this writing style can be called atomic. For example, the flex class represents that the element's display is flex. In actual development, combine these atomic classes according to the needs of the elements.

### 1.2 Contradicts Traditional Best Practices
This writing style goes against traditional practices. Usually we keep classes concise and write CSS features in corresponding classes. Although Tailwind CSS writing contradicts this, it has the following benefits:
- Faster development completion, no need to spend time thinking about class names
- Safer changes: Adding or removing classes to elements only affects that element. Therefore, there's no need to worry about breaking other pages.
- Easier maintenance of old projects: Changing content only requires finding that element and modifying the class.
- More portable code: Since structure and styles are in the same location, entire UI code blocks can be easily copied and pasted. Even between different projects.
- CSS no longer grows: Since utility classes have extremely high reusability, CSS doesn't increase as project functionality increases.

### 1.3 Difference from Inline Styles
Tailwind's writing style, compared to inline styles, from a certain perspective, they are similar, but relatively speaking, it has the following advantages:
- Design with constraints: Inline styles have each value as a number, while utility classes can choose styles, making it easier to build visually consistent UIs.
- Hover, focus, and other states: Inline styles don't support these, but Tailwind can easily use utility classes through state variants.
- Media queries: Cannot use media queries in inline styles, but Tailwind can.

### 1.4 Implementation Principle
Tailwind CSS works by scanning all HTML files, JavaScript components, and any other templates for class names, generating corresponding styles, and then writing them to static CSS files.
Because of this, we cannot use dynamically composed CSS, such as the following code:
```html
<div class="text-{{ error ? 'red' : 'green' }}-600"></div>
```
This will not recognize the text-red-600 and text-green-600 classes.
Need to use complete class names:
```html
<div class="{{ error ? 'text-red-600' : 'text-green-600' }}"></div>
```
This parsing and building process is implemented based on PostCSS, which is essentially a PostCSS plugin. It generates corresponding CSS styles for scanned classes.

## II. Basic Usage
### 2.1 Tailwind CSS Configuration in Next.js Projects
Projects created using Next.js CLI tool create-next-app can choose to support Tailwind CSS. Currently, Tailwind CSS 4.x is used by default, which is different from previous versions. 4.x has built-in support for autoprefixer.
The import in global.css is changed to:
```css
@import "tailwindcss";
```
No longer:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 2.2 Editor Environment Setup
**VSCode Plugin**
Install the Tailwind CSS IntelliSense plugin. After installation, hovering over corresponding classes can view Tailwind CSS class code.

**Prettier Plugin**
Install the prettier-plugin-tailwindcss plugin, which sorts class names for easier reading.

### 2.3 Basic Units
Tailwind CSS internally uses rem as the unit, where each 1 represents 0.25rem. For example, m-2 means margin: 0.5rem, which is 8px, gap-4 means 1rem, which is 16px.
If it's negative, add a - sign before the class, such as -m-2 meaning: margin: -0.5rem.

### 2.4 Core Concepts
**Utility Classes**
These are various built-in classes in Tailwind CSS, such as flex, bg-red-500, etc.
These classes usually represent one CSS feature. These classes can be combined to set styles.

**Hover, Focus, and Other States**
Tailwind CSS has many built-in states. The syntax format is: state name + colon + corresponding utility class to conditionally apply utility classes. For example:
> hover:bg-sky-700
When hovering over this element, use bg-sky-700.
The generated code:
```css
.hover\:bg-sky-700:hover {
  background-color: #0369a1;
}
```
Common ones include: hover, focus, active, first, last, odd, even, required, disabled, before, after, etc.
Multiple states can be used together, such as:
> hover:active:focus:bg-fuchsia-600

**Responsive Design**
By default, there are 5 breakpoints:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

When using, different classes can be set according to different breakpoint conditions, such as:
```html
<img class="w-16 md:w-32 lg:w-48" src="..." />
```
Note that Tailwind is mobile-first design, meaning our default CSS should prioritize mobile, then make targeted designs when larger than certain sizes according to breakpoint conditions. sm refers to screens larger than 40rem (640px), not specifically small screens.

**Dark Mode**
Tailwind supports dark mode through dark:, and can apply corresponding utility classes for dark mode, such as:
```html
<html data-theme="dark">
  <body>
    <div class="bg-white dark:bg-black">
      <!-- ... -->
    </div>
  </body>
</html>
```

**Theme Variables**
Tailwind supports setting CSS variables through @theme directive, can modify Tailwind's built-in variables, or add new variables, such as:
```css
@theme {
  --font-poppins: Poppins, sans-serif;
}
```

**Colors**
Tailwind CSS includes a rich, beautiful color palette out of the box, carefully crafted by professional designers, suitable for various different design styles.
Each color in the default palette contains 11 levels, where 50 is the brightest and 950 is the darkest. Colors go from light to dark.
Colors can be combined with color-related properties like bg (background), text (text), etc., to be used as utility classes. For example:
bg-sky-500, sets the background to sky color with darkness level 500.

Also note the difference from transparency writing. Transparency uses /[percentage] syntax. For example:
bg-sky-500/30, means 30% transparency.

**Adding Custom Styles**
The most commonly used custom styles are:
- @theme directive, set corresponding variables, such as:
```css
@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 120rem;
  --color-avocado-100: oklch(0.99 0 0);
  --color-avocado-200: oklch(0.98 0.04 113.22);
  --color-avocado-300: oklch(0.94 0.11 115.03);
  --color-avocado-400: oklch(0.92 0.19 114.08);
  --color-avocado-500: oklch(0.84 0.18 117.33);
  --color-avocado-600: oklch(0.53 0.12 118.34);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  /* ... */
}
```
- Use [] syntax to pass custom values.
```html
<div class="top-[117px]">
  <!-- ... -->
</div>
```

### Detecting Classes in Source Files
Tailwind scans utility classes in the project and generates all necessary CSS based on actually used classes.
So we cannot use dynamic class names in the project.
```html
<div class="text-{{ error ? 'red' : 'green' }}-600"></div>
```
Additional paths can be registered through @source directive.
```css
@import "tailwindcss";
@source "../node_modules/@acmecorp/ui-lib";
```
Can also specify paths after import:
```css
@import "tailwindcss" source("../src");
```

Or use @source not to ignore specific paths:
```css
@import "tailwindcss";
@source not "../src/components/legacy";
```

**Functions and Directives**
Functions:
- --alpha(), adjust color opacity.
```css
.my-element {
  color: --alpha(var(--color-lime-300) / 50%);
}
```
Compiled CSS:
```css
.my-element {
  color: color-mix(in oklab, var(--color-lime-300) 50%, transparent);
}
```
- --spacing()
Use --spacing() function to generate spacing values based on your theme:
```css
.my-element {
  margin: --spacing(4);
}
```
Compiled class:
```css
.my-element {
  margin: calc(var(--spacing) * 4);
}
```
This is also useful for arbitrary values, especially when combined with calc():
```css
<div class="py-[calc(--spacing(4)-1px)]">
  <!-- ... -->
</div>
```

Directives:
- @import: Inline import CSS files, including Tailwind itself
- @theme: Define custom design tokens for the project, such as fonts, colors, and breakpoints
- @source: Explicitly specify source files that Tailwind's automatic content detection didn't capture
- @utility: Add custom utilities to the project that can work with variants like hover, focus, and lg
- @variant: Apply Tailwind variants to styles in CSS
- @custom-variant: Add custom variants to the project
- @apply: Inline any existing utility classes into your own custom CSS
- @reference: Reference a CSS file, generally used in Vue's <style> modules

### 2.5 Tailwind Utility Class Usage
Classes written with Tailwind will be very long. At first glance, it might be very uncomfortable, or even incomprehensible what this element looks like after these combinations. Here are some suggestions:
- Before using, be sure to read the core concepts section in the documentation. This section is like new syntax that Tailwind extends for CSS. After understanding the rules, it's easier to understand those classes.
- Understand classes from the perspective of CSS properties. Although there are many, some are because colors, etc. cause very long content. Understanding the meaning of those prefixes basically allows quick mastery.
- Use prettier-tailwind-plugin to sort classes for smoother reading.

## III. Advanced Usage
### 3.1 Variable Settings
According to the project's design system, we need to consider:
- Semantic naming of primary and secondary brand colors.
- Custom fonts and sizes.
- Custom breakpoint settings.

### 3.2 Complex Selectors
When needing to style child elements in parent components, selectors are often needed. Let's explain usage with an example. Here's the code:
```js
<Codeblock
    codeLanguage={codeLanguage}
    allowCollapse={false}
    className="[&>div]:-m-2 [&>div]:rounded-none [&_*]:!text-xs [&_pre]:p-4"
    fromHomepage
>
    {code}
</Codeblock>
```
The className here represents:
- [&>div]:-m-2: All direct child div elements under Codeblock, set -m-2 class, which is -0.5rem margin.
- [&>div]:rounded-none: Remove rounded corners from all direct child div elements under Codeblock
- [&_*]:!text-xs: All child elements have font size of 12px.
- [&_pre]:p-4: Add p-4 class to all internal <pre> elements, which is add 1rem padding.

### 3.3 clsx and tailwind-merge
**Background**
1. In React projects, we often need to dynamically combine class names. When a certain condition is true, add a certain class. This may result in some redundant values like empty values, undefined, false, etc.
For example:
```js
function Button({ isActive, isLarge }) {
  const className = `bg-blue-500 ${isActive && "bg-blue-700"} ${isLarge && "text-lg"}`;
  return <button className={className}>Click</button>;
}
```
2. In projects, when a certain condition is met, we hope to use new class classes to override default classes. But Tailwind's priority rules are not based on class writing order, but on the actual class position in Tailwind. Classes later will override earlier classes. For example:
```js
function Card({ className }) {
  return <div className={`p-4 bg-white ${className}`}>Content</div>;
}
// Usage: <Card className="p-8 bg-gray-100" />
```
When passing p-8 and bg-gray-100, there may be cases where they can't be overridden.

**Solution**
clsx: Supports passing multiple string parameters or an object, displays corresponding classes based on conditions, and filters out irrelevant content like empty values, undefined, etc.
```js
import clsx from 'clsx';
// or
import { clsx } from 'clsx';

// Strings (variadic)
clsx('foo', true && 'bar', 'baz');
//=> 'foo bar baz'

// Objects
clsx({ foo:true, bar:false, baz:isTrue() });
//=> 'foo baz'

// Objects (variadic)
clsx({ foo:true }, { bar:false }, null, { '--foobar':'hello' });
//=> 'foo --foobar'

// Arrays
clsx(['foo', 0, false, 'bar']);
//=> 'foo bar'

// Arrays (variadic)
clsx(['foo'], ['', 0, false, 'bar'], [['baz', [['hello'], 'there']]]);
//=> 'foo bar baz hello there'

// Kitchen sink (with nesting)
clsx('foo', [1 && 'bar', { baz:false, bat:null }, ['hello', ['world']]], 'cya');
//=> 'foo bar hello world cya'
```

tailwind-merge: Mainly solves tailwind class conflicts, removes unnecessary property classes based on order.
For example:
```js
import { twMerge } from "tailwind-merge";

twMerge("p-4 bg-white p-8 bg-gray-100"); 
// Output: "p-8 bg-gray-100" (automatically removes conflicting p-4 and bg-white)
```

Usually, like the shadcn/ui project uses, these two can be encapsulated into a utility function:
```js
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## IV. Summary
Although Tailwind has a certain learning cost, after proficient use, it can greatly improve development efficiency, reduce CSS volume, reduce CSS maintenance costs, and enhance portability.
