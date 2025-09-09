<template>
  <div class="bw-container">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <h3 class="m-0">คำสั่งซื้อทั้งหมด</h3>
      <div class="d-flex align-items-center gap-2 ms-auto">
        <input v-model.trim="q" type="search" class="form-control" placeholder="ค้นหา: ชื่อ/เบอร์/รหัสออเดอร์"
          style="min-width:240px" />
        <button class="btn btn-outline-primary" :disabled="orders.loading" @click="reload">รีเฟรช</button>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead class="table-tertiary">
            <tr>
              <th style="width:180px">วันที่</th>
              <th>ชื่อสินค้า</th>
              <th class="text-center" style="width:120px">จำนวนชิ้น</th>
              <th class="text-end" style="width:160px">ยอดรวม</th>
              <th style="width:140px">สถานะ</th>
              <th style="width:140px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="orders.loading">
              <td colspan="6" class="text-center text-muted py-4">กำลังโหลด…</td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="6" class="text-center text-muted py-4">ไม่พบคำสั่งซื้อ</td>
            </tr>
            <tr v-else v-for="o in rows" :key="o.id">
              <td>
                <div class="fw-semibold">{{ dt(o.createdAt) }}</div>
                <div class="text-muted small">#{{ o.id }}</div>
              </td>
              <td class="text-truncate">
                <div class="truncate-2">
                  {{ firstItemName(o) }}
                </div>
              </td>
              <td class="text-center">{{ itemCount(o) }}</td>
              <td class="text-end">฿{{ money(o.total) }}</td>
              <td>
                <span class="badge rounded-pill" :class="badgeOf(o.status)">{{ o.status || '—' }}</span>
              </td>
              <td class="text-end">
                <router-link class="btn btn-sm btn-outline-primary" :to="`/order/${o.id}`">
                  ดูรายละเอียด
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders.js'

const orders = useOrdersStore()
const q = ref('')

onMounted(() => { orders.fetch() })

const rows = computed(() => {
  const kw = q.value.trim().toLowerCase()
  let list = (orders.list ?? []).slice()
  if (kw) {
    list = list.filter(o => {
      const id = String(o.id || '').toLowerCase()
      const name = `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.toLowerCase()
      const phone = String(o.customer?.phone || '').toLowerCase()
      const items = (o.items || []).map(it => it.name || '').join(' ').toLowerCase()
      return id.includes(kw) || name.includes(kw) || phone.includes(kw) || items.includes(kw)
    })
  }
  // เรียงล่าสุดก่อน
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return list
})

const firstItemName = (o) => {
  const items = o?.items || []
  if (!items.length) return '—'
  const first = items[0]?.name || '-'
  const more = items.length - 1
  return more > 0 ? `${first} และอีก ${more} รายการ` : first
}
const itemCount = (o) => (o?.items || []).reduce((s, it) => s + (+it.qty || 0), 0)

const money = (v) => Number(v || 0).toLocaleString()
const dt = (v) => {
  const d = v ? new Date(v) : null
  return d ? d.toLocaleString() : '—'
}
const badgeOf = (status) => {
  const s = (status || '').toLowerCase()
  if (['processing', 'pending'].includes(s)) return 'text-bg-warning'
  if (['shipped', 'shipping'].includes(s)) return 'text-bg-info'
  if (['delivered', 'success'].includes(s)) return 'text-bg-success'
  if (['cancelled', 'canceled', 'failed'].includes(s)) return 'text-bg-danger'
  return 'text-bg-secondary'
}
const reload = () => orders.fetch()
</script>

<style scoped>
.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.badge {
  font-weight: 600;
}
</style>
