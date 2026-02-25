---
toc: content
group: 
  title: Frontend Basics
  order: 4
order: 4
---

# Grid Layout

## What is Grid Layout
Grid layout divides web pages into grid units, allowing arbitrary combination of different grids to easily achieve various layout effects. It is currently the most powerful layout solution in CSS.

**Difference from Flex**
Flex is a one-dimensional layout based on axis positioning. Grid is a two-dimensional layout based on cells created by rows and columns.

## Basic Concepts
Grid layout related concepts are as follows:
- Container: Elements using Grid layout are called containers
- Items: All direct child elements are called items
- Rows: Horizontal areas of the container
- Columns: Vertical areas of the container
- Grid lines: Lines that divide the grid. Normally, n rows have n+1 horizontal grid lines, and m columns have m+1 vertical grid lines.
- Cells: Intersection areas of rows and columns. Normally, n rows and m columns have n * m cells.

## Container Properties
- grid-template-columns: Define the width of each column
- grid-template-rows: Define the height of each row
- grid-template-area: Set the name of each cell
- column-gap: Gap between columns (column spacing)
- row-gap: Gap between rows (row spacing)
- gap property is a combined shorthand for grid-column-gap and grid-row-gap. If one value is set, column spacing = row spacing.
- grid-auto-flow: Define the arrangement order and method of cells, similar to flex's flex-direction
- justify-items: Set the horizontal position of cell content
- align-items: Set the vertical position of cell content
- place-items: Combined shorthand for align-items and justify-items properties. If the second value is omitted, the browser considers it equal to the first value.
- justify-content: Horizontal position of the entire content area within the container
- align-content: Vertical position of the entire content area
- place-content: Combined shorthand for align-content and justify-content properties.
- grid-auto-columns: Define the column width of extra grids in the container
- grid-auto-rows: Define the row height of extra grids in the container
- grid-template: Shorthand for grid-template-columns, grid-template-rows, and grid-template-areas properties.
- grid: Shorthand for grid-template-rows, grid-template-columns, grid-template-areas, grid-auto-rows, grid-auto-columns, and grid-auto-flow properties.

### grid-template-columns, grid-template-rows
Set column width and row height, for example:
```css
.container {
  display: grid;
  grid-template-columns: 50px 100px 50px;
  grid-template-rows: 50px 100px 50px;
}
```
This represents a 3x3 grid with column widths of 50px, 100px, and 50px, and row heights of 50px, 100px, and 50px.

Values can be:
- Percentage: such as grid-template-columns: 25% 25% 25% 25%; and grid-template-rows: 50% 50%;
- repeat() function: For the same values, repeat can be used for shorthand, such as repeat(4, 25%), where the first parameter is the count and the second is the value
- fr: Abbreviation of "fraction", used to represent proportional relationships, such as grid-template-columns: 1fr 2fr 1fr; meaning the first and third columns have the same width, and the second column is twice their width.
- minmax() function: Set length range, parameters are minimum and maximum values, such as: grid-template-columns: 1fr 1fr minmax(100px, 1fr);
- auto: Let the browser decide the length.
- auto-fill: Adaptive
- auto-fit: Auto-fill, generally used to implement adaptive layouts

**Special value: Grid line names**
Use square brackets to specify the name of each grid line to improve code readability:
```css
.grid-container {
  display: grid;
  grid-template-columns: [main-start] 1fr [content-start] 2fr [content-end] 1fr [main-end];
}
```

### grid-template-area
Used to define grid area names:
```css
.container {
 grid-template-columns:50px 50px 50px;
 grid-template-rows: 50px 50px 50px;
 grid-template-areas: 'a b c'
                      'd e f'
                      'g h i';
}
```

### Spacing related: column-gap, row-gap, gap
For example:
```css
.container {
  grid-row-gap: 30px;
  grid-column-gap: 20px;
}
```
This means row spacing is 30px and column spacing is 20px.
gap is the combined writing of both, with the first value being row-gap and the second being column-gap.

### grid-auto-flow
Values are row and column, representing:
- row: Row first, then column
- column: Column first, then row
- row dense: Row first, then column, try to fill tightly, for cases where items span multiple cells
- column dense: Column first, then row, try to fill tightly, for cases where items span multiple cells

### Cell content position related: justify-items, align-items, place-items
justify-items property sets the horizontal position of cell content, align-items property sets the vertical position of cell content.
Values are:
- start: Left align
- end: Right align
- center: Center align
- stretch: Stretch to fill the entire width of the cell

For example:
```css
.container {
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
}
```
place-items is the shorthand for both above.
```css
place-items: <align-items> <justify-items>;
place-items: start end;
```

### Content area position related: justify-content, align-content, place-content
justify-content property is the horizontal position of the entire content area within the container (left, center, right, and space distribution), align-content property is the vertical position of the entire content area (top, center, bottom, and space distribution). The effect is the same as Flex layout. Values are:
- start: Grid as a whole aligns left/top (in LTR layout)
- end: Grid as a whole aligns right/bottom (in LTR layout)
- center: Grid as a whole centers horizontally/vertically
- stretch: Grid tracks stretch to fill the container (provided track size is not fixed)
- space-around: Evenly distribute space horizontally/vertically
- space-between: First and last tracks stick to edges, middle evenly distributed
- space-evenly: Evenly distribute space between all tracks and at both ends

For example:
```css
.container {
  display: grid;
  grid-template-columns: 100px 100px;
  grid-template-rows: 100px 100px;
  width: 500px;
  height: 500px;
  
  /* Center horizontally */
  justify-content: center;
  
  /* Evenly distribute space vertically */
  align-content: space-evenly;
}
```
place-content property is the combined shorthand for align-content and justify-content properties.
```css
place-content: <align-content> <justify-content>
```

### Extra elements related: grid-auto-columns, grid-auto-rows
Define the column width and row height of extra grids in the container. For example, if the grid is set to 2 rows and 3 columns, but there are 8 item elements in total, the syntax format is:
```css
.container {
  grid-template-columns:50px 50px 50px;
  grid-template-rows: 50px 50px ;
}
```

### grid-template
This property is the shorthand for grid-template-columns, grid-template-rows, and grid-template-areas properties.
Format:
```css
grid-template: none | 
              [ <grid-template-rows> / <grid-template-columns> ] |
              [ <grid-template-areas> [ <grid-template-rows> / <grid-template-columns> ]? ];
```

Example:
```css
/* Define rows and columns */
.container {
  grid-template: [row1-start] 100px [row1-end row2-start] 200px [row2-end] / 
                 [col1-start] 1fr [col2-start] 1fr [col-end];
}

/* Define areas, rows and columns */
.container {
  grid-template: 
    "header header header" 80px
    "nav    main   aside"  1fr
    "footer footer footer" 60px
    / 200px 1fr 150px;
}

/* Equivalent to */
.container {
  grid-template-areas: 
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-rows: 80px 1fr 60px;
  grid-template-columns: 200px 1fr 150px;
}
```

### grid
This property is the shorthand for grid-template-rows, grid-template-columns, grid-template-areas, grid-auto-rows, grid-auto-columns, and grid-auto-flow properties.
Syntax format:
```css
grid: none | 
      [ <grid-template> ] |
      [ <grid-template-rows> / [ <grid-auto-flow> [ <grid-auto-rows> [ / <grid-auto-columns> ]? ]? ]? ] |
      [ [ <grid-auto-flow> [ <grid-auto-rows> [ / <grid-auto-columns> ]? ]? ] / <grid-template-columns> ];
```

Example:
```css
/* Only define template */
.container {
  grid: 100px 200px / 1fr 1fr;
}

/* Define template and auto flow */
.container {
  grid: auto-flow dense / 1fr 1fr;
}

/* Complete example */
.container {
  grid: 
    [row1-start] "header header header" 80px [row1-end]
    [row2-start] "nav    main   aside"  1fr  [row2-end]
    [row3-start] "footer footer footer" 60px [row3-end]
    / 200px 1fr 150px;
}

/* Equivalent to */
.container {
  grid-template-areas: 
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-rows: [row1-start] 80px [row1-end row2-start] 1fr [row2-end row3-start] 60px [row3-end];
  grid-template-columns: 200px 1fr 150px;
}
```

## Item Properties
### Item position related properties
- grid-column-start: Define which vertical grid line the left border of the item aligns with
- grid-column-end: Define which vertical grid line the right border of the item aligns with
- grid-column: Shorthand for grid-column-start and grid-column-end (start / end)
- grid-row-start: Define which horizontal grid line the top border of the item aligns with
- grid-row-end: Define which horizontal grid line the bottom border of the item aligns with
- grid-row: Shorthand for grid-row-start and grid-row-end (start / end)

For example:
```css
.item-1 {
  grid-column-start: 2;
  grid-column-end: 4;
  
  /* Shorthand */
  grid-column: 2 / 4;
}
.item-2 {
  grid-row-start: 1;
  grid-row-end: 4;
  
  /* Shorthand */
  grid-row: 1 / 4;
}
```
Values are corresponding grid line names.

**Another value is span**, meaning spanning, followed by a number indicating how many grids to span.
```css
.item-1 {
  grid-column-start: span 2;
}
/* The left border of item 1 spans 2 grids from the right border. */
.item-1 {
  grid-column-end: span 2; /* Same effect as above */
}
```

### Content layout related
- justify-self: Define the horizontal position of the item within the cell area (left, center, right)
- align-self: Define the vertical position of the item within the cell area (top, center, bottom)
- place-self: Define both horizontal and vertical positions of the item within the cell area, shorthand for align-self and justify-self. If the second value is omitted, both values are equal by default.

Values are:
- start: Align with the starting edge of the cell
- end: Align with the ending edge of the cell
- center: Center within the cell
- stretch: Stretch to fill the entire width of the cell (default value)

Syntax format:
```css
.item {
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
  place-self: <align-self> <justify-self>;
}
```

### Others
- grid-area: Property specifies which area the item is placed in, with the value being the corresponding area name.
