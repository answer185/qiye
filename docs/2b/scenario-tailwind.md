---
toc: content
group: 
  title: 开发场景
  order: 30
order: 5
---
# Tailwind 开发总结
## 盒子模型
- block: 设置为块级元素
- box-border: 宽高包括padding和border
- box-content: 宽高不包括pading和border，只有内容的宽高
- padding相关：
  - p-8: padding: 0.25rem*8, 2*16px=32px
  - pt-6: padding-top
  - pr-4: padding-right
  - pb-8: pading-bottom
  - pl-2: padding-left
  - px-8: 左右两边padding
  - py-8：上下两头padding
  - ps-8: 内容起始位置padding
  - pe-8: 内容结束位置padding
  - p-[5px]: 自定义间距
  - p-(--my-padding): 使用css变量
- margin相关
  - m-8: margin: 0.25rem*8，2*16px=32px
  - mt-6: margin-top
  - mb-8: margin-bottom
  - ml-2: margin-left
  - mr-4: margin-right
  - mx-8: 左右两边的padding
  - my-8: 上下两头的padding
  - -m-8: margin: -0.25rem*8, -2*16px=-32px
  - ms-8: 内容起始位置margin
  - me-8: 内容结束位置margin
  - space-x-4: 元素之间的margin
  - space-y-4: 元素上下之间的maring（二者与gap的效果类似，但是实现形式不同，space-x使用margin-right或margin-left控制，而gap依赖gap属性）
  - m-[5px]: 自定义间距
  - m-(--my-margin): 使用css变量
- 宽度相关
  - w-96: width: 0.25rem*96, 24*16px
  - w-full: width: 100%
  - w-2/5: width: 40%
  - w-3xs: 16rem, 256px
  - w-2xs: 18rem, 288px
  - w-xs: 20rem, 320px
  - w-sm: 24rem, 384px
  - w-md: 28rem, 448px
  - w-lg: 32rem, 512px
  - w-xl: 36rem, 576px
  - w-2xl: 42rem，672px
  - w-3xl: 48rem, 768px
  - w-4xl: 56rem, 896px
  - w-5xl: 64rem, 1024px
  - w-6xl: 72rem, 1152px
  - w-7xl: 80rem, 1280px
  - w-screen: 整个窗口宽度
  - size-16: width: 16 * 0.25rem, height: 16*0.25rem
  - w-[5px]: 自定义宽度
  - w-(--my-width): 使用css变量
  - min-w-*: 最小宽度，后缀及作用与上同
  - max-w-*: 最大宽度，后缀及作用与上同
- 高度相关
  - h-96：height: 0.25rem*96, 24*16px
  - h-full: height: 100%
  - h-2/5: height: 40%
  - h-screen: 屏幕的高度
  - h-dvh: 整个视口的高度，随着浏览器的扩展和收缩变化
  - h-lvh: 设置为视口的最大可能高度
  - h-svh: 设置为视口的最小可能高度
  - h-[32rem]: 动态设置
  - h-(--my-height): 使用css变量设置
  - min-height-*: 最小高度，后缀及作用与上同
  - max-height-*: 最大高度，后缀及作用与上同
- border相关
  - border: 1px的边框
  - border-2: 2px的边框
  - border-t-4: 上边框4px
  - border-r-4: 右边框4px
  - border-b-4: 下边框4px
  - border-l-4: 左边框4px
  - border-x-4: 左右边框4px
  - border-y-4: 上下边框4px
  - border-s-4: 起始内容侧边框4px
  - broder-e-4: 结束内容侧边框4px
  - divide-x-4: 横向重合的边框4px
  - divide-y-4: 纵身重合的边框4px
  - divide-x-reverse: 确保在如flex-col-reverse情况下正确设置边框
  - divide-y-reverse: 确保在如flex-col-reverse情况下正确设置边框
  - border-[2vw]: 动态设置值
  - border-(length:--my-border-width): 使用css变量设置
  - border-solid: solid形态
  - border-dashed: dashed形态
  - border-dotted: dotted形态
  - border-double: double形态
  - border-none: 无边框
  - divide-dashed：重合边框为dashed形态
  - divide-dotted: 重合边框为dotted形态
  - border-purple-500: 边框颜色为purple-500
  - border-indigo-500/50: 边框颜色为indigo-500，透明度为50
  - border-t-indigo-500: 上边框颜色为indigo-500
  - border-r-indigo-500: 右边框颜色为indigo-500
  - border-b-indigo-500: 下边框颜色为indigo-500
  - border-l-indigo-500: 左边框颜色为indigo-500
  - border-x-indigo-500: 左右边框颜色为indigo-500
  - border-y-indigo-500: 上下边框颜色为indigo-500
  - border-s-indigo-500: 起始内容边框颜色为indigo-500
  - border-3-indigo-500: 结束内容边框颜色为indigo-500
  - divide-indigo-500: 重合边框颜色为indigo-500
  - border-[#243c5a]: 动态设置颜色
  - border-(--my-border): 使用css变量设置颜色
  - focus:border-pink-600: focus时的border颜色
  - rounded-xs: 0.125rem,2px
  - rounded-sm: 0.25rem,4px
  - rounded-md: 0.375rem,6px
  - rounded-lg: 0.5rem,8px
  - rounded-xl: 0.75rem,12px
  - rounded-2xl: 1rem,16px
  - rounded-3xl: 1.5rem,24px
  - rounded-4xl: 2rem,32px
  - rounded-t-lg: 上边框圆角
  - rounded-r-lg: 右边框圆角
  - rounded-b-lg: 下边框圆角
  - rounded-l-lg: 左边框圆角
  - rounded-tl-lg: 左上角圆角
  - rounded-tr-lg: 右上角圆角
  - rounded-br-lg: 右下角圆角
  - rounded-bl-lg: 左下角圆角
  - rounded-s-md: 起始内容圆角
  - rounded-e-md: 结束内容圆角
  - rounded-full: border-radius: 50%
  - rounded-none: 无圆角
  - rounded-[2vw]: 动态设置
  - rounded-(--my-radius): 使用css变量
- outline相关（与border的区别是：不占据空间，不支持圆角，只能统一设置4条边。设置后边框会悬浮在外部，覆盖周边内容）
  - outline: 1px的边框
  - outline-2: 2px的边框
  - outline-[2vw]: 动态设置值
  - outline-(length:--my-outline-width): 使用css变量设置
  - outline-solid: solid形态
  - outline-dashed: dashed形态
  - outline-dotted: dotted形态
  - outline-double: double形态
  - outline-hidden: 隐藏浏览器默认的效果
  - outline-none: 取消outline
  - outline-blue-500: 设置颜色为blue-500
  - outline-blue-500/50: 设置颜色为blue-500,透明度为50
  - outline-[#243c5a]: 动态设置颜色
  - outline-(--my-color): 使用css变量
  - outline-offset-2： 往外偏移2px
  - outline-offset-[2vw]: 动态设置
  - outline-offset-(--my-outline-offset) : 使用变量设置
- 背景相关
- 内容相关
## 传统布局

## Flex布局相关

## Grid布局相关

## Icons相关

## layout相关

## 表单页面相关

## 列表页面相关

## 弹窗相关

## 动画效果

## 响应式