<template>
  <div class="row g-3">
    <div class="col-12 col-md-6 col-lg-3" v-for="k in cards" :key="k.title">
      <div class="card p-3 h-100">
        <div class="text-muted">{{ k.title }}</div>
        <div class="fs-3 fw-bold">{{ k.value }}</div>
        <small class="text-muted">{{ k.subtitle }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    // ค่าปลอดภัยกรณียังโหลดไม่เสร็จ
    default: () => ({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 })
  }
})

const fmt = (n) => new Intl.NumberFormat().format(Number(n || 0))

// ทำเป็น computed เพื่อให้ reactive เมื่อ props.data เปลี่ยน
const cards = computed(() => ([
  {
    title: 'Total Revenue',
    value: fmt(props.data.totalRevenue),
    subtitle: 'รวมยอดขายทั้งหมด (฿)'
  },
  {
    title: 'Total Orders',
    value: fmt(props.data.totalOrders),
    subtitle: 'จำนวนคำสั่งซื้อ'
  },
  {
    title: 'Avg Order Value',
    value: fmt(props.data.avgOrderValue?.toFixed ? Number(props.data.avgOrderValue.toFixed(0)) : props.data.avgOrderValue),
    subtitle: 'มูลค่าเฉลี่ย/ออเดอร์ (฿)'
  }
]))
</script>
