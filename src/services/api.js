import axios from 'axios'

const baseURL = import.meta.env.DEV
  ? '/api' // dev: ใช้ vite proxy
  : (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') // prod: ใช้ env จริง

export const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' }
})

// ตัวอย่างฟังก์ชัน
export const getProducts     = () => api.get('/ecommerce-products')
export const getProductById  = (id) => api.get(`/ecommerce-products/${id}`)
export const getOrders       = () => api.get('/ecommerce-orders')
export const getOrderById    = (id) => api.get(`/ecommerce-orders/${id}`)
export const createOrder     = (p)  => api.post('/ecommerce-orders', p)
export const deleteOrder     = (id) => api.delete(`/ecommerce-orders/${id}`)
export const updateOrder     = (id, p) => api.patch(`/ecommerce-orders/${id}`, p)
