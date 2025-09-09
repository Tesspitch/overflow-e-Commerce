<template>
  <div class="bw-container">
    <div class="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
      <h3 class="m-0">รายละเอียดคำสั่งซื้อ</h3>

      <div class="d-flex gap-2">
        <router-link class="btn btn-outline-secondary btn-icon" to="/tracking" aria-label="ปิด/ย้อนกลับ" title="ปิด">
          <span aria-hidden="true">&times;</span>
          <span class="visually-hidden">ย้อนกลับ</span>
        </router-link>
        <!-- (เอาปุ่มลบออกจากหัวตามที่ย้ายแล้ว) -->
      </div>
    </div>

    <div v-if="loading" class="card p-5 text-center text-muted">กำลังโหลด…</div>
    <div v-else-if="!order" class="card p-5 text-center text-danger">ไม่พบคำสั่งซื้อ</div>

    <template v-else>
      <!-- Header -->
      <div class="card mb-3 p-3">
        <div class="d-flex flex-wrap align-items-center justify-content-between">
          <div>
            <div class="text-muted small">รหัสคำสั่งซื้อ</div>
            <div class="fs-5 fw-semibold">#{{ order.id }}</div>
          </div>
          <div>
            <div class="text-muted small">วันที่สั่งซื้อ</div>
            <div class="fw-semibold">{{ dt(order.createdAt) }}</div>
          </div>
          <div>
            <div class="text-muted small">สถานะ</div>
            <span class="badge rounded-pill fs-6" :class="badgeOf(order.status)">{{ order.status || '—' }}</span>
          </div>
          <div>
            <div class="text-muted small">ยอดรวม</div>
            <div class="fs-5 fw-semibold">฿{{ money(order.total) }}</div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <!-- รายการสินค้า -->
        <div class="col-12 col-lg-7">
          <div class="card">
            <div class="card-header bg-body-tertiary fw-semibold">สินค้า</div>
            <div class="list-group list-group-flush">
              <div class="list-group-item" v-for="(it, idx) in (order.items || [])"
                :key="String(it.id) + '-' + (variantText(it) || '') + '-' + idx">
                <div class="d-flex align-items-center gap-3">
                  <img :src="it.image || placeholder" :alt="it.imageAlt || it.name"
                    style="width:72px;height:72px;object-fit:cover" class="rounded">
                  <div class="flex-fill">
                    <div class="fw-semibold">
                      {{ it.name }}
                      <span v-if="variantText(it)"
                        class="badge bg-secondary-subtle text-secondary-emphasis fw-semibold ms-1">
                        {{ variantText(it) }}
                      </span>
                    </div>
                    <div class="text-muted small">{{ it.brand || '-' }} · {{ it.category || '-' }}</div>
                    <div class="text-muted small">฿{{ money(it.price) }} × {{ it.qty }}</div>
                  </div>
                  <div class="fw-semibold">฿{{ money(lineTotal(it)) }}</div>
                </div>
              </div>

              <div v-if="!order.items?.length" class="list-group-item text-center text-muted py-4">
                ไม่มีสินค้าในคำสั่งซื้อนี้
              </div>
            </div>
          </div>
        </div>

        <!-- ผู้สั่งซื้อ + ชำระเงิน -->
        <div class="col-12 col-lg-5">
          <div class="card mb-3">
            <div class="card-header bg-body-tertiary fw-semibold">ข้อมูลผู้สั่งซื้อ</div>
            <div class="card-body">
              <div class="mb-2">
                <div class="text-muted small">ชื่อ-นามสกุล</div>
                <div class="fw-semibold">{{ order.customer?.firstName }} {{ order.customer?.lastName }}</div>
              </div>
              <div class="mb-2">
                <div class="text-muted small">เบอร์โทร</div>
                <div class="fw-semibold">{{ order.customer?.phone || '—' }}</div>
              </div>
              <div>
                <div class="text-muted small">ที่อยู่</div>
                <div class="fw-semibold white-space-pre">{{ order.customer?.address || '—' }}</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header bg-body-tertiary fw-semibold">การชำระเงิน & สรุปยอด</div>
            <div class="card-body">
              <div class="mb-2">
                <div class="text-muted small">ช่องทางชำระเงิน</div>
                <div class="fw-semibold">{{ payLabel(order.customer?.paymentMethod) }}</div>
              </div>
              <hr />
              <div class="d-flex justify-content-between">
                <div>Subtotal</div>
                <div>฿{{ money(subtotal) }}</div>
              </div>
              <div class="d-flex justify-content-between">
                <div>Shipping</div>
                <div>฿{{ money(shipping) }}</div>
              </div>
              <div class="d-flex justify-content-between fw-bold fs-5 mt-2">
                <div>Total</div>
                <div>฿{{ money(order.total) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ปุ่มแอ็กชันด้านล่าง -->
      <div class="d-flex align-items-center justify-content-end mt-4">

        <button v-if="order" class="btn btn-outline-danger" @click="openDeleteConfirm" :disabled="removing">
          ลบคำสั่งซื้อ
        </button>
      </div>
    </template>

    <!-- Confirm Delete Modal -->
    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true" ref="confirmEl">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">ยืนยันการลบคำสั่งซื้อ</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" :disabled="removing"
              aria-label="ปิด"></button>
          </div>
          <div class="modal-body">
            ต้องการลบคำสั่งซื้อ <strong>#{{ order?.id }}</strong> ใช่หรือไม่?<br />
            <small class="text-muted">การลบนี้ไม่สามารถย้อนกลับได้</small>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bs-dismiss="modal" :disabled="removing">ยกเลิก</button>
            <button class="btn btn-danger" @click="doDelete" :disabled="removing">
              <span v-if="removing" class="spinner-border spinner-border-sm me-1" role="status"
                aria-hidden="true"></span>
              ยืนยันลบ
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- /Confirm Delete Modal -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { useOrdersStore } from '@/stores/orders'
import { useProductsStore } from '@/stores/products'

const route = useRoute()
const router = useRouter()
const orders = useOrdersStore()
const products = useProductsStore()

const order = ref(null)
const loading = ref(true)
const removing = ref(false)
const placeholder = 'https://placehold.co/600x400?text=Product'

onMounted(async () => {
  loading.value = true
  try {
    if (!products.list.length) await products.fetch()

    const id = route.params.id
    const data = await orders.getById(id)

    const hydratedItems = (data?.items || []).map(it => {
      const p = products.list.find(x => String(x.id) === String(it.id))
      return {
        ...it,
        image: it.image || p?.image || null,
        imageAlt: it.imageAlt || p?.imageAlt || it.name,
        brand: it.brand || p?.brand,
        category: it.category || p?.category,
      }
    })

    order.value = { ...data, items: hydratedItems }
  } catch (e) {
    console.error('[order.detail]', e)
    order.value = null
  } finally {
    loading.value = false
  }
})

/* ---------- ยืนยันลบ ---------- */
const confirmEl = ref(null)
let confirmIns = null
const openDeleteConfirm = () => {
  confirmIns = confirmIns || new Modal(confirmEl.value)
  confirmIns.show()
}
const closeDeleteConfirm = () => confirmIns?.hide()

const doDelete = async () => {
  if (!order.value?.id) return
  removing.value = true
  try {
    const id = order.value.id
    if (typeof orders.delete === 'function') await orders.delete(id)
    else if (typeof orders.remove === 'function') await orders.remove(id)
    else if (typeof orders.destroy === 'function') await orders.destroy(id)
    else throw new Error('orders store ไม่มีเมธอดลบ (delete/remove/destroy)')

    closeDeleteConfirm()
    router.push('/tracking')
  } catch (e) {
    console.error('[order.delete]', e)
    alert('ลบคำสั่งซื้อไม่สำเร็จ: ' + (e?.message || 'ไม่ทราบสาเหตุ'))
  } finally {
    removing.value = false
  }
}

/* ---------- utils ---------- */
const lineTotal = (it) => (+it.price || 0) * (+it.qty || 0)
const subtotal = computed(() => (order.value?.items || []).reduce((s, it) => s + lineTotal(it), 0))
const shipping = computed(() => {
  const t = +order.value?.total || 0
  const sub = subtotal.value
  return Math.max(0, t - sub)
})

const variantText = (it) => {
  const v = it?.variant
  if (!v) return ''
  if (typeof v === 'string') return v
  return v.label || v.key || ''
}

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
const payLabel = (v) => {
  const s = (v || '').toLowerCase()
  if (s === 'cod') return 'เก็บเงินปลายทาง (COD)'
  if (s === 'bank') return 'โอนผ่านธนาคาร'
  if (s === 'card') return 'บัตรเครดิต/เดบิต'
  return '—'
}
</script>

<style scoped>
.white-space-pre {
  white-space: pre-line;
}

.badge {
  font-weight: 600;
}

.btn-icon{
  width: 40px;
  height: 40px;
  padding: 0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size: 20px;
  line-height: 1;
}
</style>
