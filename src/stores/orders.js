import { defineStore } from 'pinia'
import { getOrders, getOrderById, createOrder, deleteOrder } from '@/services/api.js'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    list: [],
    loading: false,
    error: null,
  }),

  getters: {
    // KPI ง่าย ๆ
    kpi: (s) => {
      const totalOrders  = s.list.length
      const totalRevenue = s.list.reduce((a, o) => a + (Number(o.total) || 0), 0)
      const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0
      return { totalOrders, totalRevenue, avgOrderValue }
    },
  },

  actions: {
    /* -------- Fetch all -------- */
    async fetch() {
      this.loading = true
      this.error = null
      try {
        const { data } = await getOrders()
        this.list = Array.isArray(data) ? data : []
      } catch (e) {
        this.error = e?.message || 'โหลดออเดอร์ไม่ได้'
        this.list = []
      } finally {
        this.loading = false
      }
    },

    /* -------- Get by id -------- */
    async getById(id) {
      // ลองหาในแคชก่อน
      const cached = this.list.find(o => String(o.id) === String(id))
      if (cached) return cached
      const { data } = await getOrderById(id)
      return data
    },

    /* -------- Create -------- */
    async create(payload) {
      const { data } = await createOrder(payload)
      // อัปเดต list เพื่อ KPI/หน้ารวมทันที
      if (data) {
        // กันซ้ำกรณี API คืน id เดิม
        this.list = [data, ...this.list.filter(o => String(o.id) !== String(data.id))]
      }
      return data
    },

    /* -------- Delete (and aliases) -------- */
    async delete(id) {
      // optimistic update: เอาออกจาก list ก่อน แล้วค่อยเรียก API
      const prev = this.list.slice()
      this.list = this.list.filter(o => String(o.id) !== String(id))
      try {
        await deleteOrder(id)
        // ok: list คงไว้ตามที่ลบ
        return true
      } catch (e) {
        // fail: rollback
        this.list = prev
        throw e
      }
    },

    // เผื่อ UI ฝั่งอื่นเรียกชื่อเมธอดต่างกัน
    async remove(id)   { return this.delete(id) },
    async destroy(id)  { return this.delete(id) },
  },
})
