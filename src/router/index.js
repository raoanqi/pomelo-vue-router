import Vue from 'vue'
import VueRouter from '@/router/pomeloVueRouter'

const HomeView = () => import('@/views/HomeView.vue')
const AboutView = () => import('@/views/AboutView.vue')

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