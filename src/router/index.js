import Vue from 'vue'
import VueRouter from '@/router/pomeloVueRouter'

const HomeView = () => import('@/views/HomeView.vue')
const AboutView = () => import('@/views/AboutView.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  // 模式指定为hash模式
  mode: 'hash',
  // 使用的路由表
  routes: [
    {
      path: '/home',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'About',
      component: AboutView
    }
  ]
})

export default router