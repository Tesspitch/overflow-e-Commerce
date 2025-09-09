// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/pages/Home.vue') },

    { path: '/product/:id', name: 'product', component: () => import('@/pages/ProductDetail.vue') },

    { path: '/kpi', name: 'kpi', component: () => import('@/pages/KPI.vue') },

    { path: '/checkout', name: 'checkout', component: () => import('@/pages/Checkout.vue') },

    // ใช้ /tracking เป็นหลัก และทำ alias ให้ /order ชี้มาหน้านี้
    { path: '/tracking', alias: ['/order'], name: 'tracking', component: () => import('@/pages/Tracking.vue') },

    // รายละเอียดออเดอร์ตามหมายเลข
    { path: '/order/:id', name: 'order-detail', component: () => import('@/pages/OrderDetail.vue') },

    // กัน 404 ให้เด้งกลับหน้าแรก
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior: () => ({ top: 0 })
})

export default router
