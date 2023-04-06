### 前端路由的作用
路由描述的是 URL 与 UI 之间的映射关系，这种映射是单向的，即 URL 变化引起 UI 更新（无需刷新页面）

### 实现前端路由的两个核心问题
* 如何改变url但是不引起页面刷新
* 如何检测url的变化

### hash实现
hash 是 URL 中 hash (#) 及后面的那部分，常用作锚点在页面内进行导航，改变 URL 中的 hash 部分不会引起页面刷新

通过 hashchange 事件监听 URL 的变化，改变 URL 的方式只有这几种：

* 通过浏览器前进后退改变 URL
* 通过a标签改变 URL
* 通过window.location改变URL

### history实现
history 提供了 pushState 和 replaceState 两个方法，这两个方法改变 URL 的 path 部分不会引起页面刷新



