---
title: 前端预加载优化
toc: content
group:
  title: 前端开发
  order: 1
order: 6
---

# 前端预加载优化

## 什么是预加载
预加载就是在浏览器真正需要资源之前，提前告诉浏览器“这个资源很重要，早点下载”。通过以下3个标签实现：
- preload： 预加载当前页面的内容
- prefetch： 预请求下一个页面的内容，优先级高
- preconnect： 预连接某个第三方站点

| 属性       | 使用时机    | 优先级 |
| -------- | ------- | --- |
| preload  | 当前页面马上用 | 高   |
| prefetch | 未来页面可能用 | 低   |
| preconnect | 当前页面提前建立连接 | 高  |

常见的写法：
```js
<link rel="preload">
<link rel="prefetch">
<link rel="preconnect">

import(/* webpackPrefetch */)
import(/* webpackPreload */)
```

## 实例
### 首屏大图
在img标签上加上相应的preload标签
```html
<link
  rel="preload"
  as="image"
  href="/banner.webp"
/>
```
Nextjs中使用priority标签

```js
import Image from 'next/image'

export default function Page() {
  return (
    <Image
      src="/banner.webp"
      alt="banner"
      priority
      fill
    />
  )
}
```

与图片懒加载技术的区别：
- 图片的预加载会将图片的请求优先级调到高，一般在首屏里可以看到图片上使用。
- 懒加载是延迟加载图片，在窗口滚动到相应位置后才展示。
- 懒加载的标签是loading="layzy"

```html
<img src="a.jpg" />
<img src="b.jpg" loading="lazy" />
<img src="c.jpg" loading="lazy" />
```
通常电商的列表页面

NextJS的Image组件，默认就是懒加载的。

### 预加载下一个页面
如加载商品详情页面

webpack的方式：
```js
const DetailPage = React.lazy(() =>
  import(/* webpackPrefetch: true */ './DetailPage')
)
```

或者hover某个位置时触发：
```js
const preloadDetail = () => {
  import('./DetailPage')
}

<button
  onMouseEnter={preloadDetail}
  onClick={() => navigate('/detail')}
>
  查看详情
</button>
```
### 预连接第三方接口（减少 DNS + TLS 时间）
比如第三方服务，如支付；CDN。
```js
<link rel="preconnect" href="https://api.payment.com" />
<link rel="preconnect" href="https://cdn.xxx.com" />
```

#### 预加载字体
通常字体的加载是在解析css的过程时，遇到后才开始加载，这个时间是比较延后的。
所以字体通常也是需要预加载的
```js
<link
  rel="preload"
  as="font"
  href="/fonts/inter.woff2"
  type="font/woff2"
  crossorigin
/>
```
## 不足
预加载不能太多，太多反而会占用带宽，从而