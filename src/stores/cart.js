// src/stores/cart.js
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] // [{ uid, id, name, price, qty, image, brand, category, variant? }]
  }),

  getters: {
    count: (s) => s.items.reduce((n, it) => n + Number(it.qty || 0), 0),
    subtotal: (s) =>
      s.items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0),
  },

  actions: {
    _findIndexByIdOrUid(idOrUid) {
      const byUid = this.items.findIndex(it => it.uid === String(idOrUid))
      if (byUid !== -1) return byUid
      // fallback – ถ้าให้มาเป็น id ธรรมดาและมีตัวเดียว
      const byId = this.items.findIndex(it => String(it.id) === String(idOrUid))
      return byId
    },

    add(product, qty = 1) {
      const variantKey = product?.variant?.key || null
      const uid = variantKey ? `${product.id}@${variantKey}` : String(product.id)

      const base = {
        uid,
        id: product.id,
        name: product.name,
        price: Number(product.price || 0), // ราคาที่ส่งเข้ามาควรเป็นราคาตามรุ่นแล้ว (ฝั่ง UI จัดให้)
        qty: Number(qty) || 1,
        image: product.image,
        brand: product.brand,
        category: product.category,
        variant: product.variant || undefined, // {key,label}
      }

      const i = this.items.findIndex(it => it.uid === uid)
      if (i !== -1) {
        this.items[i].qty += base.qty
      } else {
        this.items.push(base)
      }
    },

    changeQty(idOrUid, qty) {
      const i = this._findIndexByIdOrUid(idOrUid)
      if (i === -1) return
      const q = Math.max(0, Number(qty) || 0)
      if (q <= 0) this.items.splice(i, 1)
      else this.items[i].qty = q
    },

    remove(idOrUid) {
      const i = this._findIndexByIdOrUid(idOrUid)
      if (i !== -1) this.items.splice(i, 1)
    },

    clear() { this.items = [] },
  },
})
