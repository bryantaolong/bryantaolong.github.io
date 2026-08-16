import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('../views/Home.vue') },
    { path: '/about', component: () => import('../views/About.vue') },
    { path: '/blog', component: () => import('../views/Blog.vue') },
    { path: '/post/:filename?', component: () => import('../views/Post.vue') }
  ]
})
