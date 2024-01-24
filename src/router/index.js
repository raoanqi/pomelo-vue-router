import Vue from 'vue'
// import VueRouter from 'vue-router'
import VueRouter from '@/router/pomeloVueRouter'

// 下面这种语法并不能顺
const HomeView = () => import('@/views/HomeView.vue')
const AboutView = () => import('@/views/AboutView.vue')

// import HomeView from "@/views/HomeView";
// import AboutView from "@/views/AboutView";

// console.log(HomeView)

Vue.use(VueRouter)

const routes = [
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

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router