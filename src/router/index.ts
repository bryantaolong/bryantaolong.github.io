import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('../pages/Home.vue') },
    { path: '/about', component: () => import('../pages/About.vue') },
    { path: '/blog', component: () => import('../pages/Blog.vue') },
    { path: '/post/:filename?', component: () => import('../pages/Post.vue') }
  ]
})
