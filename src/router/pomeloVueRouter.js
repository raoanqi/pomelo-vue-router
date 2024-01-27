let Vue = null

class HistoryRoute {
  constructor() {
    /**
     * @type {null}
     * 我们创建的路由实例中，需要对当前激活的路由进行缓存，缓存的是一个对象，初始化时为null
     */
    this.current = null
  }
}

// 使用时需要通过new VueRouter来创建一个路由实例，因此定义一个class
class VueRouter {
  /**
   * @param options
   * VueRouter的构造器
   * 在构造路由实例时，传入一系列的配置options
   * options中至少包含使用的路由模式hash，路由表routes
   */
  constructor(options) {
    // 路由模式默认为hash模式
    this.mode = options.mode || 'hash'
    // 路由表默认为空[]
    this.routes = options.routes || []
    // 为了便于处理，将数组形式的使用路由表转换为对象形式
    this.routesMap = this.createMap(this.routes)
    console.log('转换之前的routes', this.routes)
    console.log('转换之后的routes', this.routesMap)
    this.history = new HistoryRoute()
    //  对路由进行初始化
    this.init()
  }

  /**
   * 将数组形式的路由转换为对象形式：
   * 使用reduce方法将routes数组处理成为对象形式
   */
  createMap(routes) {
    return routes.reduce((prev, current) => {
      prev[current.path] = current.component
      return prev
    }, {})
  }

  /**
   * 初始化路由
   */
  init() {
    if (this.mode === 'hash') {
      /**
       * 针对hash模式
       * 如果url中没有hash，就设置为默认的hash:#/
       */
      (!location.hash) && (location.hash = '#/');
      /**
       * 当第一次进入页面或者手动刷新页面时，监听load事件
       * load事件触发时，将当前激活的hash进行截取并缓存到当前路由实例的history属性中
       * 截取的规则是slice(1)，因为createMap函数中的key是/xxx的形式，所以这里hash值的#需要删除，#在hash串的索引中位0，所以是slice(1)
       */
      window.addEventListener('load', () => {
        console.log('load事件触发')
        this.history.current = location.hash.slice(1)
      })
      /**
       * 当切换hash值去更新其中的组件时，会触发hashchange事件
       * 此时与上面一样，也要将当前激活的路由缓存到当前路由实例的history属性中
       */
      window.addEventListener('hashchange', () => {
        console.log('hash change事件触发')
        this.history.current = location.hash.slice(1)
      })
    } else {
      /**
       * 如果不是采用hash模式，则根据window.location.pathname进行操作
       * 如果没有pathname，就将pathname设置为默认的/
       * 举例：https://www.example.com/path/to/page?query=123中pathname是/path/to/page
       */
      (!location.pathname) && (location.pathname = '/');
      /**
       * 当第一次进入页面或者手动刷新页面时，监听load事件
       * load事件触发时，将当前激活的hash进行截取并缓存到当前路由实例的history属性中
       * 这里并不需要像hash模式中去截取，因为pathname就是/开头，createMap中生成的路由对象的key也是/xxx的形式，二者是一致的
       */
      window.addEventListener('load', () => {
        console.log('load事件触发')
        this.history.current = location.pathname
      })
      /**
       * 监听popstate事件
       */
      window.addEventListener('popstate', () => {
        console.log('popstate事件触发')
        this.history.current = location.pathname
      })
    }
  }
}

/**
 * vue.use(plugin)
 * plugin可以是一个对象，也可以是一个函数
 * 如果是对象，必须要提供一个install方法
 * 如果是函数，那么这个函数就会被作为install方法
 * vue在调用install方法的时候，会将vue作为参数传入，install方法被同一个插件多次调用时，插件也只会被安装一次
 */

/**
 * $route与$router的区别？
 * $route是当前的路由对象
 * $router是VueRouter的实例对象
 */

/**
 * @param v
 * @returns {VNode|any|null|parser.Selector}
 * 在使用vue-router时，是通过Vue.use(router)的方式进行使用，因此需要提供插件形式
 * 这里提供一个install方法供Vue.use进行调用
 * Vue.use在调用时，会将Vue传入到这个install中
 */
VueRouter.install = function (v) {
  Vue = v
  /**
   * mixin是全局混入，会影响到项目中的每一个组件
   */
  Vue.mixin({
    beforeCreate() {
      /**
       * 在vue应用初始化时，方式为：
       * new Vue({
       *   router,
       *   render: h => h(App),
       * }).$mount('#app')
       * 可以看到options中包含了router对象，这个时候相当于只有根组件才有router对象
       * 因此如果this.$options.router为true，说明当前的这个组件为根组件
       */
      if (this.$options?.router) {
        // 既然此时是根组件，那么这个this自然就指向了根组件，因此采用_root属性进行记录
        // 同时，用_router属性记录应用中的router实例
        this._root = this
        this._router = this.$options.router
        // 实现history的响应式，借助了vue内部的定义响应式的方法
        Vue.util.defineReactive(this, 'xxx', this._router.history)
      } else {
        /**
         * 为什么说子组件的父组件中一定会有router对象的引用呢？
         * 有子组件时，钩子函数的执行顺序是：
         * 父组件的befroecreate
         * 父组件的created
         * 父组件的beforemount
         * 子组件的beforecreate
         * 子组件的created
         * 子组件的beforemount
         * 子组件的mounted
         * 父组件的mounted
         * 因此，当子组件执行beforecreate的时候，父组件的beforecreate已经执行完毕，因此父组件中必然存在_root属性
         * 所以直接取父组件的_root即可
         */
        // 上面已经处理了根组件的情况，剩下的就是子组件
        this._root = this.$parent?._root
      }

      /**
       * 将$router,$route挂载到当前的组件实例上
       */
      this.$router = this._root._router

      /**
       * 这里采用这种Object.defineProperty的方式是为了确保$route是一个只读的
       * 在文档中要求$route是一个只读对象
       */
      Object.defineProperty(this, '$route', {
        get() {
          return this._root._router.history.current
        }
      })
    }
  })

  /**
   * 实现router-link
   * router-link在使用时，会向组件内部传入to属性，代表对应的路由，说明需要使用props接收
   */
  Vue.component('router-link', {
    props: {
      // 传入的to属性，代表对应路由
      to: {
        type: String,
        default: () => ''
      }
    },

    render(h) {
      const mode = this._self._root._router.mode
      const to = mode === 'hash' ? `#${this.to}` : this.to
      return h('a', {
        attrs: {href: to}
      }, this.$slots.default)
    }
  })

  /**
   * 实现router-view
   * 请注意一点，render函数中的this实际是指向这个这个组件的一个proxy代理对象，而并不是组件本身
   * 因此我们通过_self属性获取真实的组件的引用
   */
  Vue.component('router-view', {
    render(h) {
      const current = this._self._root._router.history.current
      const routeMap = this._self._root._router.routesMap
      return h(routeMap[current])
    }
  })
}

export default VueRouter