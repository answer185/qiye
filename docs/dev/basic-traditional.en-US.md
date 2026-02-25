---
toc: content
group: 
  title: Frontend Basics
  order: 4
order: 3
---

# Traditional Layout Methods

## What is it
Traditional layout methods refer to commonly used layout methods before Flex and Grid appeared, including:
- Document flow: This is the default layout method, elements are arranged in HTML order
- Inline block: Convert block-level elements to inline layout.
- Float layout: Make elements break out of normal document flow.
- Position layout: Use relative and absolute positioning to offset element positions.
- Table layout: Treat each element as part of a table.
- Multi-column layout: Similar to newspaper column effects

Among these, inline block and float can now be implemented more elegantly using Flex. Table and multi-column layouts have also been replaced by Grid layout.

## Document Flow
This is the simplest layout method. CSS divides HTML elements into block-level elements and inline elements. Their characteristics are as follows:

- Block-level elements:
  - Vertical arrangement: Each block-level element (such as `<div>`, `<p>`, `<h1>`) defaults to occupying a full row, stacking from top to bottom.
  - Default width 100%: Block-level elements automatically fill the parent container's width (unless manually setting width).
  - Height determined by content: If height is not set, height adapts to content.

- Inline elements:
  - Horizontal arrangement: Inline elements (such as `<span>`, `<a>`, `<strong>`) don't wrap, arranged from left to right, automatically wrapping when row width is full.
  - Width and height determined by content: Cannot directly set width and height, but can set padding and margin (left and right effective, top and bottom may not affect layout).

When rendering, elements are sorted from top to bottom, left to right according to HTML order.

## Inline Block
Because inline elements cannot set width and height, inline block elements are needed. That is, set block-level elements' display to inline-block:
```css
.inline-block {
  display: inline-block;
  width: 100px;
  height: 50px;
  background: lightblue;
}
```

## Float Layout
Set element's float property to left/right to break out of normal document flow, achieving custom layout effects.
For example:
```css
.float-box {
  float: left;
  width: 100px;
  height: 100px;
  background: lightcoral;
}
```

html:
```html
<div class="float-box">Floating Box</div>
<p>This text will wrap around the floating element.</p>
```

## Position Layout
Achieve custom layouts by modifying the position property:
- position: absolute/fixed (absolute/fixed positioning)
- position: sticky (sticky positioning, breaks out under specific conditions)

## Others
Table layout and multi-column layout are rarely used themselves, especially table layout, which has performance issues: any modification at any position will cause re-rendering.

## Shortcomings of Traditional Layout
- Lack of true responsive capability: Requires extensive manual intervention.
- Fragile code: Depends on precise calculations, content changes easily break layout.
- Low development efficiency: Need to write redundant code to solve browser compatibility issues.
- Doesn't meet modern design needs: Difficult to implement complex interactions or dynamic effects.

Now new projects generally prioritize using Flexbox (one-dimensional layout) and Grid (two-dimensional layout), with traditional layout only used for compatibility with old browsers or specific scenarios (such as text wrapping around images).
