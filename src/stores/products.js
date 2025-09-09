import { defineStore } from 'pinia'
import { getProducts } from '@/services/api.js'

export const useProductsStore = defineStore('products', {
  state: () => ({
    list: [],
    loading: false,
    error: null,
  }),
  getters: {
    categories: (s) => [...new Set(s.list.map(p => p.category).filter(Boolean))],
    brands: (s) => [...new Set(s.list.map(p => p.brand).filter(Boolean))],
  },
  actions: {
    async fetch () {
      this.loading = true; this.error = null
      try {
        const { data } = await getProducts()
        // คาดหวังฟิลด์: id, name, price, brand, category, image, description
        this.list = Array.isArray(data) ? data : []
      } catch (e) {
        this.error = e?.message || 'โหลดสินค้าไม่ได้'
        this.list = []
      } finally { this.loading = false }
    }
  }
})
