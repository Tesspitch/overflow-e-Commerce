<!-- src/views/Home.vue -->
<template>
  <div class="container-fluid px-5">
    <div class="row">
      <!-- Sidebar -->
      <div class="col-12 col-lg-2 p-0 order-2 order-lg-1">
        <Sidebar />
      </div>

      <!-- Main -->
      <div class="col-12 col-lg-10 order-1 order-lg-2">
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <h3 class="m-0">สินค้า</h3>

          <!-- ปุ่มหมวดหมู่ (มือถือ) -->
          <button
            class="btn btn-ghost d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#catDrawer"
            aria-controls="catDrawer"
          >
            หมวดหมู่
          </button>

          <div class="d-flex gap-2 mt-2 align-items-center">
            <!-- สลับโหมดแสง -->
            <button
              class="btn btn-ghost btn-icon"
              type="button"
              :aria-label="theme==='dark' ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'"
              @click="toggleTheme"
              title="Toggle theme"
            >
              <span v-if="theme==='dark'">☀️</span>
              <span v-else>🌙</span>
            </button>

            <select class="form-select" v-model="sort">
              <option value="">จัดเรียง</option>
              <option value="price-asc">ราคาต่ำ → สูง</option>
              <option value="price-desc">ราคาสูง → ต่ำ</option>
            </select>
          </div>
        </div>

        <!-- Products -->
        <div class="row row-cols-2 row-cols-sm-1 row-cols-md-3 row-cols-xl-5 g-3">
          <div class="col" v-for="p in productsPage" :key="p.id">
            <div
              class="card h-100"
              role="button"
              tabindex="0"
              style="cursor:pointer"
              @click="openQuick(p)"
              @keydown.enter.prevent="openQuick(p)"
              @keydown.space.prevent="openQuick(p)"
            >
              <img :src="p.image || placeholder" class="card-img-top" :alt="p.name" loading="lazy" />
              <div class="card-body d-flex flex-column">
                <h6 class="card-title">{{ p.name }}</h6>
                <p class="text-muted mb-2">
                  {{ p.brand || '-' }} ·
                  <span class="badge bg-body-secondary text-body">{{ p.category || '-' }}</span>
                </p>
                <div class="mt-auto d-flex justify-content-between align-items-center">
                  <strong>{{ displayPrice(p) }}</strong>
                  <button
                    class="btn btn-cta btn-sm"
                    @click.stop="hasInventory(p) ? openQuick(p) : addToCartDirect(p)"
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 mt-4">
          <small class="text-muted">
            แสดง {{ pageStart + 1 }}–{{ Math.min(pageEnd, totalItems) }} จาก {{ totalItems }} รายการ
          </small>
          <nav aria-label="pagination" class="w-100 w-sm-auto">
            <ul class="pagination justify-content-center mb-0 pagination-sm elegant-pagination">
              <li class="page-item" :class="{ disabled: currentPage <= 1 }">
                <button class="page-link" @click="prevPage" :disabled="currentPage <= 1">ก่อนหน้า</button>
              </li>
              <li class="page-item disabled">
                <span class="page-link">
                  หน้า {{ currentPage }} / {{ totalPages || 1 }}
                </span>
              </li>
              <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
                <button class="page-link" @click="nextPage" :disabled="currentPage >= totalPages">ถัดไป</button>
              </li>
            </ul>
          </nav>
        </div>
      </div> <!-- /main -->
    </div> <!-- /row -->

    <!-- Quick View Modal -->
    <div class="modal fade" id="quickModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ quick?.name || 'รายละเอียดสินค้า' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
          </div>
          <div class="modal-body">
            <div v-if="!quick" class="text-center text-muted py-5">กำลังโหลด...</div>
            <template v-else>
              <div class="row g-4">
                <div class="col-12 col-lg-6">
                  <img :src="quick.image || placeholder" class="img-fluid rounded" :alt="quick.name" />
                </div>
                <div class="col-12 col-lg-6">
                  <!-- ตัวเลือกรุ่น -->
                  <VariantPicker
                    v-if="quick?.inventory"
                    :product="quick"
                    v-model="variantKey"
                    class="mb-2"
                  />
                  <div class="mb-1 text-muted">
                    {{ quick.brand || '-' }} · {{ quick.category || '-' }}
                  </div>
                  <h4 class="mb-2">฿{{ effPrice.toLocaleString() }}</h4>
                  <p class="mb-3">{{ quick.description || '—' }}</p>

                  <div class="input-group" style="max-width:220px">
                    <span class="input-group-text">จำนวน</span>
                    <input
                      type="number"
                      class="form-control"
                      v-model.number="quickQty"
                      :min="1"
                      :max="effStock || undefined"
                    />
                  </div>

                  <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-cta" :disabled="!canAdd" @click="addToCartFromQuick(quick, quickQty)">
                      เพิ่มเข้าตะกร้า
                    </button>
                    <button class="btn btn-ghost" data-bs-dismiss="modal">ยกเลิก</button>
                  </div>
                </div>
              </div>

              <hr class="my-4" />
              <h6>สินค้าในหมวดเดียวกัน</h6>
              <div class="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-3">
                <div class="col" v-for="r in related" :key="r.id">
                  <div class="card h-100" role="button" style="cursor:pointer" @click="openQuick(r)">
                    <img :src="r.image || placeholder" class="card-img-top" :alt="r.name" />
                    <div class="card-body d-flex flex-column">
                      <small class="text-muted mb-1">{{ r.brand || '-' }}</small>
                      <div class="fw-semibold">{{ r.name }}</div>
                      <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span>฿{{ displayPriceNumber(r).toLocaleString() }}</span>
                        <button class="btn btn-ghost btn-sm" @click.stop="hasInventory(r) ? openQuick(r) : addToCartDirect(r)">
                          เพิ่ม
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-bs-dismiss="modal">ปิด</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart + Checkout Modal -->
    <div class="modal fade" id="checkoutModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">ตะกร้า & ชำระเงิน</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
          </div>
          <div class="modal-body">
            <div v-if="!items.length" class="text-center text-muted py-5">ยังไม่มีสินค้าในตะกร้า</div>

            <div v-else>
              <div v-for="it in items" :key="it.id" class="d-flex align-items-center gap-3 py-2 border-bottom">
                <img :src="it.image || placeholder" alt="" style="width:72px;height:72px;object-fit:cover" class="rounded" />
                <div class="flex-fill">
                  <div class="fw-semibold">{{ it.name }}</div>
                  <small class="text-muted">฿{{ toMoney(it.price) }}</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <input type="number" min="1" class="form-control" style="width:90px" v-model.number="it.qty" @change="changeQty(it)" />
                  <button class="btn btn-ghost" @click="remove(it.id)">ลบ</button>
                </div>
              </div>

              <div class="row g-3 mt-3">
                <div class="col-12 col-lg-7">
                  <div class="card p-3">
                    <h6 class="mb-2">ข้อมูลผู้สั่งซื้อ</h6>
                    <div class="row g-2">
                      <div class="col-md-6">
                        <label class="form-label">ชื่อ</label>
                        <input v-model.trim="form.firstName" class="form-control" required />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">นามสกุล</label>
                        <input v-model.trim="form.lastName" class="form-control" required />
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">เบอร์โทร</label>
                        <input v-model.trim="form.phone" class="form-control" type="tel" required />
                      </div>
                      <div class="col-12">
                        <label class="form-label">ที่อยู่</label>
                        <textarea v-model.trim="form.address" class="form-control" rows="3"></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-lg-5">
                  <div class="card p-3">
                    <h6 class="mb-2">ช่องทางชำระเงิน</h6>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" id="pm1" value="cod" v-model="form.paymentMethod" />
                      <label class="form-check-label" for="pm1">เก็บเงินปลายทาง (COD)</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" id="pm2" value="bank" v-model="form.paymentMethod" />
                      <label class="form-check-label" for="pm2">โอนผ่านธนาคาร</label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" id="pm3" value="card" v-model="form.paymentMethod" />
                      <label class="form-check-label" for="pm3">บัตรเครดิต/เดบิต</label>
                    </div>

                    <hr />
                    <div class="d-flex justify-content-between"><div>Subtotal</div><div>฿{{ toMoney(subtotal) }}</div></div>
                    <div class="d-flex justify-content-between"><div>Shipping</div><div>฿{{ toMoney(shipping) }}</div></div>
                    <div class="d-flex justify-content-between fw-bold fs-5 mt-2"><div>Total</div><div>฿{{ toMoney(total) }}</div></div>
                    <button :disabled="!canSubmit" class="btn btn-cta w-100 mt-3" @click="placeOrder">ยืนยันสั่งซื้อ</button>
                  </div>
                </div>
              </div>
            </div>
          </div><!-- /modal-body -->
        </div>
      </div>
    </div> <!-- ปิด Cart Modal -->

    <!-- Toast -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:2000; pointer-events:none">
      <div class="toast text-bg-success border-0 shadow" ref="cartToastEl" role="alert" aria-live="assertive" aria-atomic="true" style="pointer-events:auto">
        <div class="d-flex align-items-center">
          <div class="toast-body">
            <strong class="me-1">✓</strong> {{ cartToastMsg }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  </div> <!-- /container -->
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal, Toast } from 'bootstrap'
import Sidebar from '@/components/SideBar.vue'
import VariantPicker from '@/components/VariantPicker.vue'
import { useKeywordFromRoute } from '@/composables/useSearch.js'

import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'

import {
  hasInventory,
  minPrice,
  firstAvailableVariantKey,
  priceFor,
  stockFor
} from '@/utils/product'

const productsStore = useProductsStore()
const cartStore = useCartStore()
const ordersStore = useOrdersStore()

const route = useRoute()
const router = useRouter()

/* THEME */
const theme = ref(localStorage.getItem('theme') || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
const applyTheme = (t) => document.documentElement.setAttribute('data-bs-theme', t)
onMounted(() => applyTheme(theme.value))
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(theme.value)
  localStorage.setItem('theme', theme.value)
}

/* FILTERS & SORT */
const qFromUrl = useKeywordFromRoute()
const sort = ref('')
const selectedCategory = computed(() => route.query.category ?? '')

/* PAGINATION */
const pageSize = 30
const currentPage = ref(Math.max(1, parseInt(route.query.page || '1', 10) || 1))
watch(() => route.query.page, (v) => {
  const n = Math.max(1, parseInt(v || '1', 10) || 1)
  if (n !== currentPage.value) currentPage.value = n
})

/* DATA */
const quick = ref(null)
const variantKey = ref('')
const quickQty = ref(1)
const placeholder = 'https://placehold.co/600x400?text=Product'

const items = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)
const shipping = computed(() => (subtotal.value > 0 ? 50 : 0))
const total = computed(() => subtotal.value + shipping.value)

const form = ref({ firstName: '', lastName: '', phone: '', address: '', paymentMethod: 'cod' })
const canSubmit = computed(() => items.value.length > 0 && form.value.firstName && form.value.lastName && form.value.phone && form.value.address)

onMounted(() => { productsStore.fetch() })

/* ---------- FILTERED LIST ---------- */
const productsFiltered = computed(() => {
  let list = (productsStore.list ?? []).slice()
  const keyword = (qFromUrl.value || '').trim().toLowerCase()

  if (keyword) {
    list = list.filter(p => {
      const seo = Array.isArray(p.seo) ? p.seo.join(' ') : (p.seo || '')
      return ([p.name, p.brand, p.category, p.description, seo]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword))
    })
  }
  if (selectedCategory.value) list = list.filter(p => p.category === selectedCategory.value)
  if (sort.value === 'price-asc')  list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
  if (sort.value === 'price-desc') list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
  return list
})

watch([qFromUrl, selectedCategory, sort], () => goPage(1))

/* ---------- PAGINATION COMPUTEDS ---------- */
const totalItems  = computed(() => productsFiltered.value.length)
const totalPages  = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)))
const pageStart   = computed(() => (currentPage.value - 1) * pageSize)
const pageEnd     = computed(() => pageStart.value + pageSize)
const productsPage = computed(() => productsFiltered.value.slice(pageStart.value, pageEnd.value))

function goPage(n) {
  const page = Math.min(Math.max(1, n), totalPages.value)
  if (page === currentPage.value && String(route.query.page || '1') === String(page)) return
  currentPage.value = page
  const next = { ...route.query, page: page > 1 ? String(page) : undefined }
  router.replace({ name: route.name || 'home', query: next })
}
const nextPage = () => goPage(currentPage.value + 1)
const prevPage = () => goPage(currentPage.value - 1)

/* ---------- PRICE DISPLAY ---------- */
const displayPriceNumber = (p) => hasInventory(p) ? minPrice(p) : Number(p.price || 0)
const displayPrice = (p) => `฿${displayPriceNumber(p).toLocaleString()}`

/* ---------- QUICK VIEW ---------- */
let quickModal
const openQuick = async (p) => {
  const list = productsStore.list ?? []
  quick.value = typeof p === 'object' ? p : list.find(x => String(x.id) === String(p))
  if (!quick.value) return

  variantKey.value = hasInventory(quick.value) ? (firstAvailableVariantKey(quick.value) || '') : ''
  quickQty.value = 1

  quickModal = quickModal || new Modal(document.getElementById('quickModal'))
  quickModal.show()

  await nextTick()
  document.querySelector('#quickModal .modal-body')?.scrollTo({ top: 0, behavior: 'smooth' })
}

const effPrice = computed(() => priceFor(quick.value, variantKey.value))
const effStock = computed(() => stockFor(quick.value, variantKey.value))
const canAdd   = computed(() => {
  if (!quick.value) return false
  const stock = effStock.value ?? Infinity
  return stock > 0 && quickQty.value >= 1 && quickQty.value <= stock
})

const related = computed(() => {
  if (!quick.value) return []
  return (productsStore.list ?? [])
    .filter(x => x.category === quick.value.category && x.id !== quick.value.id)
    .slice(0, 8)
})

/* ---------- CART / CHECKOUT ---------- */
let checkoutModal
const openCart = () => {
  checkoutModal = checkoutModal || new Modal(document.getElementById('checkoutModal'))
  checkoutModal.show()
}

const addToCartDirect = (p) => {
  cartStore.add({ ...p, price: Number(p.price || 0) }, 1)
  showAddedToast(p, 1)
}
const addToCartFromQuick = (p, qty = 1) => {
  const key = p?.inventory ? variantKey.value : null
  const payload = {
    ...p,
    price: key ? priceFor(p, key) : Number(p.price || 0),
    variant: key ? { key, label: key } : undefined,
  }
  cartStore.add(payload, qty)
  showAddedToast(payload, qty)
}

const changeQty = (it) => cartStore.changeQty(it.id, it.qty)
const remove    = (id) => cartStore.remove(id)

/* ---------- ORDER ---------- */
function cleanupModals() {
  document.querySelectorAll('.modal.show').forEach(el => { try { (Modal.getInstance(el) || new Modal(el)).hide() } catch {} })
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('paddingRight')
}

const placeOrder = async () => {
  const payload = {
    customer: { ...form.value },
    items: items.value.map(it => ({
      id: it.id,
      name: it.name,
      qty: it.qty,
      price: it.price,
      brand: it.brand,
      category: it.category,
      variant: it.variant?.key || it.variant || null,
      image: it.image,
      imageAlt: it.imageAlt || it.name,
    })),
    total: total.value,
    status: 'processing',
    createdAt: new Date().toISOString(),
  }
  try {
    const saved = await ordersStore.create(payload)
    cartStore.clear()

    const el = document.getElementById('checkoutModal')
    if (el) {
      const inst = Modal.getInstance(el) || new Modal(el)
      el.addEventListener('hidden.bs.modal', () => {
        cleanupModals()
        router.push(`/order/${saved?.id ?? ''}`)
      }, { once: true })
      inst.hide()
    } else {
      cleanupModals()
      router.push(`/order/${saved?.id ?? ''}`)
    }
  } catch (e) {
    alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + (e?.message || 'ไม่ทราบสาเหตุ'))
  }
}

/* ---------- TOAST ---------- */
const cartToastEl = ref(null)
let cartToast = null
const cartToastMsg = ref('')

onMounted(() => {
  if (cartToastEl.value) cartToast = new Toast(cartToastEl.value, { delay: 2200, autohide: true })
})
const showAddedToast = (item, qty = 1) => {
  const q = Number(qty) || 1
  cartToastMsg.value = `เพิ่ม "${item?.name ?? 'สินค้า'}"${item?.variant?.label ? ` (${item.variant.label})` : ''} × ${q} ลงตะกร้าแล้ว`
  if (!cartToast && cartToastEl.value) cartToast = new Toast(cartToastEl.value, { delay: 2200, autohide: true })
  cartToast?.show()
}

/* ---------- UTIL ---------- */
const toMoney = (v) => Number(v || 0).toLocaleString()
</script>

<style scoped>
/* ===== Elegant Buttons ===== */


.btn-cta{
  --cta-bg: var(--bs-primary);
  --cta-bg-2: color-mix(in oklab, var(--bs-primary) 88%, black);
  background-image: linear-gradient(180deg, var(--cta-bg), var(--cta-bg-2));
  color: #fff;
  border: 0;
  border-radius: 999px;
  padding: .55rem 1rem;
  box-shadow: 0 6px 18px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.06);
  transition: transform .12s ease, box-shadow .2s ease, filter .2s ease;
}
.btn-cta:hover{
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow: 0 10px 22px rgba(0,0,0,.10), 0 3px 10px rgba(0,0,0,.06);
  color:#fff;
}
.btn-cta:active{
  transform: translateY(0);
  filter: brightness(.98);
  box-shadow: 0 3px 10px rgba(0,0,0,.12);
}
.btn-cta:disabled{
  filter: grayscale(.2) opacity(.8);
}
.btn-cta.btn-sm{
  padding: .4rem .8rem;
}

/* Secondary / Ghost (โปร่งหรู, กลมกลืนกับ Light/Dark) */
.btn-ghost{
  background: color-mix(in oklab, var(--bs-body-bg) 80%, transparent);
  border: 1px solid var(--bs-border-color);
  color: var(--bs-body-color);
  border-radius: 999px;
  padding: .5rem .9rem;
  transition: background .2s ease, color .2s ease, transform .12s ease, box-shadow .2s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,.04);
}
.btn-ghost:hover{
  background: color-mix(in oklab, var(--bs-body-bg) 92%, var(--bs-primary) 8%);
  transform: translateY(-1px);
}
.btn-ghost:active{
  transform: translateY(0);
}
.btn-ghost.btn-sm{
  padding: .35rem .7rem;
}

/* ปุ่มไอคอนทรงกลม */
.btn-icon{
  width: 38px; height: 38px; padding: 0;
  display: inline-grid; place-items: center;
}

/* ปรับ badge ให้กลมกลืนทั้ง light/dark */
.badge.bg-body-secondary{
  background-color: var(--bs-secondary-bg) !important;
  color: var(--bs-secondary-color) !important;
  border: 1px solid var(--bs-border-color);
  border-radius: 999px;
  font-weight: 600;
}


.elegant-pagination .page-link{
  border: 0;
  border-radius: 999px !important;
  background: var(--bs-tertiary-bg);
  color: var(--bs-body-color);
  padding: .45rem .9rem;
  margin: 0 .25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
  transition: background .2s ease, transform .12s ease;
}
.elegant-pagination .page-link:hover{
  background: color-mix(in oklab, var(--bs-tertiary-bg) 80%, var(--bs-primary) 10%);
  transform: translateY(-1px);
}
.elegant-pagination .page-item.disabled .page-link{
  opacity: .55;
  transform: none;
}

.badge, .card-title { font-weight: 600; }
</style>
