<template>
  <div class="bw-container">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>KPI Dashboard</h3>
      <router-link class="btn btn-outline-primary" to="/">ย้อนกลับ</router-link>
    </div>

    <div class="card p-3 mb-3">
      <div class="d-flex gap-2 align-items-end flex-wrap">
        <div>
          <label class="form-label">ตั้งแต่วันที่</label>
          <input type="date" class="form-control" v-model="fromDate">
        </div>
        <div>
          <label class="form-label">ถึงวันที่</label>
          <input type="date" class="form-control" v-model="toDate">
        </div>
        <button class="btn btn-bw" @click="refresh">
          รีเฟรช KPI
        </button>
      </div>
      <small class="text-muted mt-2 d-block" v-if="rangeText">
        ช่วงวันที่ที่ใช้คำนวณ: {{ rangeText }}
      </small>
    </div>

    <KPIWidget :data="kpiRange" />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import KPIWidget from '@/components/KPIWidget.vue'

const orders = useOrdersStore()

// ฟิลเตอร์ช่วงวันที่จาก input type=date (รูปแบบ YYYY-MM-DD)
const fromDate = ref('')
const toDate   = ref('')

onMounted(() => { orders.fetch() })

/* แปลงวันที่เป็นช่วงเวลาใช้งานจริง:
   - from = 00:00:00 ของวันเริ่ม
   - to   = 23:59:59.999 ของวันสิ้นสุด (รวมทั้งวัน) */
const startOfDay = (ymd) => ymd ? new Date(`${ymd}T00:00:00`) : null
const endOfDay   = (ymd) => ymd ? new Date(`${ymd}T23:59:59.999`) : null

const rangeText = computed(() => {
  if (!fromDate.value && !toDate.value) return ''
  if (fromDate.value && toDate.value) return `${fromDate.value} – ${toDate.value}`
  return fromDate.value ? `ตั้งแต่ ${fromDate.value}` : `ถึง ${toDate.value}`
})

/* สร้างลิสต์ออเดอร์ที่ตรงช่วงวันที่ (คำนวณฝั่ง client)
   - หาก from > to จะสลับให้ถูกต้องอัตโนมัติ */
const filteredOrders = computed(() => {
  const all = orders.list || []
  let from = startOfDay(fromDate.value)
  let to   = endOfDay(toDate.value)

  if (from && to && from.getTime() > to.getTime()) {
    const tmp = from; from = to; to = tmp
  }

  return all.filter(o => {
    // createdAt อาจเป็น ISO string
    const t = o?.createdAt ? new Date(o.createdAt) : null
    if (!t || Number.isNaN(t.getTime())) return false
    if (from && t < from) return false
    if (to && t > to) return false
    return true
  })
})

/* KPI ที่คำนวณจาก filteredOrders (reactive ตามช่วงวันที่) */
const kpiRange = computed(() => {
  const list = filteredOrders.value
  const totalOrders  = list.length
  const totalRevenue = list.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0
  return { totalOrders, totalRevenue, avgOrderValue }
})

/* ปุ่มรีเฟรช: โหลดข้อมูลล่าสุดจากเซิร์ฟเวอร์ (ฟิลเตอร์ยังคงทำฝั่ง client) */
const refresh = () => { orders.fetch() }
</script>
