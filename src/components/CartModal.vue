<!-- src/components/CartModal.vue -->
<template>
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
              <img :src="it.image || placeholder" alt="" style="width:72px;height:72px;object-fit:cover" class="rounded"/>
              <div class="flex-fill">
                <div class="fw-semibold">{{ it.name }}</div>
                <small class="text-muted">฿{{ toMoney(it.price) }}</small>
              </div>
              <div class="d-flex align-items-center gap-2">
                <input type="number" min="1" class="form-control" style="width:90px" v-model.number="it.qty" @change="changeQty(it)" />
                <button class="btn btn-outline-danger" @click="remove(it.id)">ลบ</button>
              </div>
            </div>

            <div class="row g-3 mt-3">
              <div class="col-12 col-lg-7">
                <div class="card p-3">
                  <h6 class="mb-2">ข้อมูลผู้สั่งซื้อ</h6>
                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label">ชื่อ</label required>
                      <input v-model.trim="form.firstName" class="form-control" required/>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">นามสกุล</label required>
                      <input v-model.trim="form.lastName" class="form-control" required/>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">เบอร์โทร</label>
                      <input :type="phone" v-model.trim="form.phone" class="form-control" type="tel" required/>
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
                    <input class="form-check-input" type="radio" id="pm1" value="cod" v-model="form.paymentMethod"/>
                    <label class="form-check-label" for="pm1">เก็บเงินปลายทาง (COD)</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="pm2" value="bank" v-model="form.paymentMethod"/>
                    <label class="form-check-label" for="pm2">โอนผ่านธนาคาร</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="pm3" value="card" v-model="form.paymentMethod"/>
                    <label class="form-check-label" for="pm3">บัตรเครดิต/เดบิต</label>
                  </div>

                  <hr/>
                  <div class="d-flex justify-content-between"><div>Subtotal</div><div>฿{{ toMoney(subtotal) }}</div></div>
                  <div class="d-flex justify-content-between"><div>Shipping</div><div>฿{{ toMoney(shipping) }}</div></div>
                  <div class="d-flex justify-content-between fw-bold fs-5 mt-2"><div>Total</div><div>฿{{ toMoney(total) }}</div></div>

                  <button :disabled="!canSubmit" class="btn btn-bw w-100 mt-3" @click="placeOrder">ยืนยันสั่งซื้อ</button>
                </div>
              </div>
            </div>
          </div>
        </div><!-- /modal-body -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import Modal from 'bootstrap/js/dist/modal'

const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const router = useRouter()

const items = computed(() => cartStore.items)
const subtotal = computed(() => cartStore.subtotal)
const shipping = computed(() => (subtotal.value > 0 ? 50 : 0))
const total = computed(() => subtotal.value + shipping.value)

const form = ref({ firstName:'', lastName:'', phone:'', address:'', paymentMethod:'cod' })
const canSubmit = computed(() => items.value.length>0 && form.value.firstName && form.value.lastName && form.value.phone && form.value.address)

const placeholder = 'https://placehold.co/600x400?text=Product'
const toMoney = (v) => Number(v||0).toLocaleString()
const changeQty = (it) => cartStore.changeQty(it.id, it.qty)
const remove = (id) => cartStore.remove(id)

async function placeOrder () {
  const payload = {
    customer: { ...form.value },
    items: items.value.map(it => ({ id:it.id, name:it.name, qty:it.qty, price:it.price, brand:it.brand, category:it.category })),
    total: total.value, status: 'processing', createdAt: new Date().toISOString(),
  }
  try {
    const saved = await ordersStore.create(payload)
    cartStore.clear()
    const el = document.getElementById('checkoutModal')
    if (el) Modal.getOrCreateInstance(el).hide()
    router.push(`/order/${saved?.id ?? ''}`)
  } catch (e) {
    alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + (e?.message || 'ไม่ทราบสาเหตุ'))
  }
}
</script>
