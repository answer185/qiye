---
toc: content
group: 
  title: Frontend Basics
  order: 4
order: 3
---

# Flex Layout

**Background and Purpose**
Traditional web layout solutions are based on the box model, relying on display + position properties + float properties. This is very inconvenient for some special layouts, such as vertical centering.

Flex layout can simply, completely, and responsively implement various page layouts, making it simpler and more convenient than before.

## **I. What is Flex Layout**
Flex is the abbreviation of Flexible Box, meaning "flexible layout", used to provide maximum flexibility for the box model.

Any container can be specified as Flex layout:

```css
.box {
    display: flex;
}
```

Inline elements can also use Flex layout:

```css
.box {
    display: inline-flex;
}
```

Webkit kernel browsers must add the -webkit prefix:

```css
.box {
    display: -webkit-flex; /*Safari*/
    display: flex;
}
```

Note: After setting Flex layout, the float, clear, and vertical-align properties of child elements will become invalid.

## **II. Basic Concepts**

*   Elements using Flex layout are called Flex containers (flex container), referred to as containers.
*   All child elements automatically become container members, called Flex items (flex item), referred to as items
    ![flex basic concepts](http://www.ruanyifeng.com/blogimg/asset/2015/bg2015071004.png)
*   By default, there are 2 axes: the horizontal main axis (main axis) and the vertical cross axis (cross axis)
*   main start: the starting position of the main axis (intersection point with the border)
*   main end: the ending position of the main axis
*   cross start: the starting position of the cross axis
*   cross end: the ending position of the cross axis
*   main size: items are arranged along the main axis by default, the main axis space occupied by a single item is called main size
*   cross size: the cross axis space occupied

## **III. Container Properties**
There are 6 properties that can be set on the container:

*   flex-direction
*   flex-wrap
*   flex-flow
*   justify-content
*   align-items
*   align-content

### *3.1 flex-direction:*
Determines the direction of the main axis (i.e., the arrangement direction of items).
```css
.box {
    flex-direction: row | row-reverse | column | column-reverse;
}
```
The meaning of the 4 values:

*   row (default value): The main axis is horizontal, starting from the left end.
*   row-reverse: The main axis is horizontal, starting from the right end.
*   column: The main axis is vertical, starting from the top edge.
*   column-reverse: The main axis is vertical, starting from the bottom edge.

### *3.2 flex-wrap*
Sets how to wrap when one line cannot fit:
```css
.box {
    flex-wrap: nowrap | wrap | wrap-reverse;
}
```
The meaning of the 3 values:

*   nowrap (default): No wrapping
*   wrap: Wrap, with the first line on top
*   wrap-reverse: Wrap, with the first line on bottom

### *3.3 flex-flow*
The flex-flow property is a shorthand for flex-direction and flex-wrap, default is row nowrap:
```css
.box {
    flex-flow: <flex-direction> || <flex-wrap>;
}
```

### *3.4 justify-content*
Defines the alignment of items on the main axis:
```css
.box {
    justify-content: flex-start | flex-end | center | space-between | space-around;
}
```
The meaning of the 5 values:

*   flex-start (default value): Left align
*   flex-end: Right align
*   center: Center
*   space-between: Justify with equal spacing between items
*   space-around: Equal spacing on both sides of each item. So the distance between items is twice the spacing between items and borders

### *3.5 align-items*
Defines how items align on the cross axis:
```css
.box {
    align-items: flex-start | flex-end | center | baseline | stretch
}
```
The meaning of the 5 values:

*   flex-start: Align with the starting point of the cross axis
*   flex-end: Align with the ending point of the cross axis
*   center: Align with the center of the cross axis
*   baseline: Align with the baseline of the first line of text in the item
*   stretch (default value): If the item is not set with height or set to auto, it will fill the entire height of the container

### *3.6 align-content*
Defines the alignment of multiple axes. If there is only one line (only one axis), this property has no effect:
```css
.box {
    align-content: flex-start | flex-end | center |
    space-between | space-around | stretch;
}
```
The meaning of the 6 values:

*   flex-start: Align with the starting point of the cross axis
*   flex-end: Align with the ending point of the cross axis
*   center: Align with the center of the cross axis
*   space-between: Align with both ends of the cross axis, with equal spacing between axes
*   space-around: Equal spacing on both sides of each axis. So the spacing between axes is twice the spacing between axes and borders
*   stretch (default value): Axes fill the entire cross axis.

## **IV. Item Properties**
There are 6 properties that can be set on items:

*   order
*   flex-grow
*   flex-shrink
*   flex-basis
*   flex
*   align-self

### *4.1 order*
Defines the arrangement order of items, the smaller the value, the earlier the position:
```css
.item {
    order: <integer>;
}
```

### *4.2 flex-grow*
When there is remaining space, defines the proportion of the item's expansion:
Default is 0, meaning it won't expand even if there is remaining space:
```css
.item {
    flex-grow: <number>; 
}
```
If all items have flex-grow property of 1, they will equally share the remaining space.
If one item has flex-grow of 2 and others have 1, the former will occupy twice as much remaining space as other items.

### *4.3 flex-shrink*
When space is insufficient, defines the shrinking proportion of the item:
Default is 1, meaning when space is insufficient, the item will shrink:
```css
.item {
    flex-shrink: <number>;
}
```
If all items have flex-shrink property of 1, when space is insufficient, they will shrink proportionally.
If one item has flex-shrink property of 0 and others have 1, when space is insufficient, the former won't shrink.
Negative values are invalid for this property.

### *4.4 flex-basis*
Defines the main axis space (main size) occupied by the item before allocating extra space:
Default value is auto, which is the original size of the item:
```css
.item {
    flex-basis: <length> | auto;
}
```

### *4.5 flex Property*
The flex property is a shorthand for flex-grow, flex-shrink, and flex-basis:
Default value is 0 1 auto, the last two properties are optional:
```css
.item {
    flex: none | [<flex-grow> <flex-shrink>? || <flex-basis>]
}
```
This property has 2 shortcut values: auto (1 1 auto) and none (0 0 auto).
It's recommended to use this property first instead of writing separate properties, because the browser will calculate related values.

### *4.6 align-self*
Allows individual items to have different alignment from other items, can override align-items:
Default value is auto, meaning inheriting the align-items property of the parent element:
If there is no parent element, it's equivalent to stretch.
```css
.item {
    align-self: auto | flex-start | flex-end | center | baseline | stretch
}
```
Except for auto, other values are the same as align-items.
