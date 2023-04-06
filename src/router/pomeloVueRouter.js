let Vue = null

class HistoryRoute {
    constructor() {
        // 路由实例中需要存储当前的路径信息，代表当前激活的路由，用一个对象表示，默认是null
        this.current = null
    }
}

// 使用时需要通过new VueRouter来创建一个路由实例，因此定义一个class
class VueRouter {
    /**
     * 在new VueRouter时，我们传入了一个{},这个就是这里的options
     * options其中包含了mode，默认为hash模式
     * 另外就是routes路由表对象
     * @param options
     */
    constructor(options) {
        this.mode = options.mode || 'hash'
        this.routes = options.routes || []
        // 实际上我们直接处理routes数组比较困难，因此将路由表转换为Map结构
        this.routesMap = this.createMap(this.routes)
        console.log('改造之后的routes', this.routesMap)
        //
        this.history = new HistoryRoute()
        //  对路由进行初始化
        this.init()
    }

    createMap(routes) {
        // 注意reduce的使用
        /**
         * 使用reduce方法将routes数组处理成为对象形式
         * path: component info
         *
         */
        return routes.reduce((prev, current) => {
            prev[current.path] = current.component
            return prev
        }, {})
    }

    // 初始化路由
    /**
     * 初始化路由时，需要判断路由使用的mode是hash还是history
     *
     */
    init() {
        if (this.mode === 'hash') {
            // 如果是hash模式
            // 判断是否存在hash，初始化的时候是没有hash的，这个时候默认跳转到#/
            (!location.hash) && (location.hash = '#/');
            window.addEventListener('load', () => {
                this.history.current = location.hash.slice(1)
            })
            window.addEventListener('hashchange', () => {
                this.history.current = location.hash.slice(1)
            })
        } else {
            (!location.pathname) && (location.pathname = '/');
            window.addEventListener('load', () => {
                this.history.current = location.pathname
            })
            window.addEventListener('popstate', () => {
            })
            this.history.current = location.pathname
        }
    }
}

/**
 * vue.use(plugin)
 * plugin可以是一个对象，也可以是一个函数
 * 如果是对象，必须要提供一个install方法
 * 如果是函数，那么这个函数就会被作为install方法
 * vue在调用install方法的时候，会将vue作为参数传入，install方法被同一个插件多次调用时，插件也只会被安装一次
 *
 */

/**
 * $route与$router的区别？
 * $route是当前的路由对象
 * $router是VueRouter的实例对象
 * 在项目中
 */

// 使用时通过vue.use()，所以需要有一个install方法
VueRouter
    .install = function (v) {
    // 将传入的Vue保存给提前定义的变量Vue
    Vue = v
    console.log(v)

    // 混入到vue的初始参数options中
    Vue.mixin({
        beforeCreate() {
            // 这里使用beforecreate而不是created的原因在于created钩子中$options已经初始化好了
            /**
             *  在main.js中，router的使用方法是在new Vue的options种传入router，
             *  但是这个new出来的实例是根组件，因此理论上只有根组件能拿到这个router实例，
             *  实际上我们需要每个组件内部都存在对同一个router实例的引用，因此需要针对每一个vue组件
             *  都获取到当前项目的根组件，这样再访问根组件中的router实例即可
             *  */
            if (this.$options?.router) {
                // 如果是根组件，此时this指向根组件自身，因此用_root属性存储自身的引用，用_router存储这个传入的router实例的引用
                this._root = this
                this._router = this.$options.router
                // 实现history的响应式，借助了vue内部的定义响应式的方法
                Vue.util.defineReactive(this, 'xxx', this._router.history)
            } else {
                //  如果是子组件，就用_root记录到根组件的引用
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
                this._root = this.$parent?._root
            }

            // 然后将$router属性挂载到当前的组件上
            // todo:这里为什么要使用这种方式进行挂载，直接this.$router=xxx会有什么问题
            Object.defineProperty(this, '$router', {
                get() {
                    return this._root._router
                }
            })

            // 实现$route，即当前的路由信息
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
        // 稍微深入一下render函数
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
     * 请注意一点，render函数中的this实际是指向这个这个组件的一个proxy代理对象，而并不是组件本身，这个通过162行的打印代码可以看出来
     * 因此我们通过_self属性获取真实的组件的引用
     *
     */
    Vue.component('router-view', {
        render(h) {
            console.log(this)
            console.log(this._self)
            const current = this._self._root._router.history.current
            const routeMap = this._self._root._router.routesMap
            return h(routeMap[current])
        }
    })
}

// 最终将类导出
export default VueRouter