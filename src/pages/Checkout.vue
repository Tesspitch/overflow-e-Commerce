<template>
  <div class="bw-container">
    <h3 class="mb-3">Checkout</h3>

    <div class="row g-3">
      <div class="col-12 col-lg-7">
        <div class="card p-3">
          <h5>ข้อมูลผู้สั่งซื้อ</h5>
          <div class="row g-2 mt-1">
            <div class="col-12 col-md-6">
              <label class="form-label">ชื่อ</label>
              <input v-model.trim="form.firstName" class="form-control" required aria-required="true" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">นามสกุล</label>
              <input v-model.trim="form.lastName" class="form-control" required />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">เบอร์โทร</label>
              <input v-model.trim="form.phone" class="form-control" type="tel" required />
            </div>
            <div class="col-12">
              <label class="form-label">ที่อยู่</label>
              <textarea v-model.trim="form.address" class="form-control" rows="3" required></textarea>
            </div>
          </div>
        </div>

        <div class="card p-3 mt-3">
          <h5>ช่องทางชำระเงิน</h5>
          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="pm1" value="cod" v-model="form.paymentMethod">
            <label class="form-check-label" for="pm1">เก็บเงินปลายทาง (COD)</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="pm2" value="bank" v-model="form.paymentMethod">
            <label class="form-check-label" for="pm2">โอนผ่านธนาคาร</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="pm3" value="card" v-model="form.paymentMethod">
            <label class="form-check-label" for="pm3">บัตรเครดิต/เดบิต</label>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-5">
        <div class="card p-3">
          <h5>สรุปรายการ</h5>
          <div v-for="it in cart.items" :key="it.id" class="d-flex justify-content-between py-1">
            <div>{{ it.name }} × {{ it.qty }}</div>
            <div>฿{{ (Number(it.price) * it.qty).toLocaleString() }}</div>
          </div>
          <hr />
          <div class="d-flex justify-content-between">
            <div>Subtotal</div>
            <div>฿{{ cart.subtotal.toLocaleString() }}</div>
          </div>
          <div class="d-flex justify-content-between">
            <div>Shipping</div>
            <div>฿{{ shipping.toLocaleString() }}</div>
          </div>
          <div class="d-flex justify-content-between fw-bold fs-5 mt-2">
            <div>Total</div>
            <div>฿{{ total.toLocaleString() }}</div>
          </div>
          <button :disabled="!canSubmit" class="btn btn-bw w-100 mt-3" @click="placeOrder">ยืนยันสั่งซื้อ</button>
        </div>
      </div>
    </div>

    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index:1085">
      <div class="toast align-items-center border-0" :class="toastVariant" ref="toastEl" role="alert"
        aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            <div class="fw-semibold">{{ toastMsg }}</div>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
            aria-label="Close"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Toast, Modal } from 'bootstrap'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// --- toast state ---
const toastEl = ref(null)
let toastIns
const toastMsg = ref('')
const toastVariant = ref('text-bg-success')

onMounted(() => {
  if (toastEl.value) {
    
    toastIns = new Toast(toastEl.value, { delay: 2500 })
  }
})

// กันกดซ้ำ
const placing = ref(false)

// เคลียร์ modal/backdrop ค้าง
function cleanupModals() {
  document.querySelectorAll('.modal.show').forEach(el => {
    try { (Modal.getInstance(el) || new Modal(el)).hide() } catch { }
  })
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('paddingRight')
}

const placeOrder = async () => {
  if (placing.value) return
  placing.value = true

  const payload = {
    customer: { ...form }, // ถ้า form เป็น ref() ใช้ {...form.value}
    items: cart.items.map(it => ({ id: it.id, name: it.name, qty: it.qty, price: it.price })),
    total: total.value,
    status: 'processing',
    createdAt: new Date().toISOString(),

  }

  try {
    const saved = await orders.create(payload)
    cart.clear()

    // เตรียม toast (เผื่อยังไม่ถูกสร้าง)
    if (!toastIns && toastEl.value) toastIns = new Toast(toastEl.value, { delay: 2500 })

    toastVariant.value = 'text-bg-success'
    toastMsg.value = `สั่งซื้อสำเร็จ! เลขคำสั่งซื้อ #${saved?.id ?? '-'} • ยอดรวม ฿${total.value.toLocaleString()}`

    // เคลียร์ modal/backdrop ค้าง (สำคัญถ้าเพิ่งมาจากหน้าโมดัล)
    cleanupModals()

    // หลัง toast ปิดค่อยนำทาง (มี fallback กัน event ไม่ยิง)
    const go = () => router.push(`/order/${saved?.id || ''}`)
    if (toastEl.value) {
      toastEl.value.addEventListener('hidden.bs.toast', go, { once: true })
      toastIns?.show()
      // เผื่อบางธีมปิด autohide → ตั้ง fallback 3 วิ
      setTimeout(() => { try { go() } catch { } }, 3200)
    } else {
      go()
    }
  } catch (e) {
    toastVariant.value = 'text-bg-danger'
    toastMsg.value = 'เกิดข้อผิดพลาดในการสั่งซื้อ: ' + (e?.message || 'ไม่ทราบสาเหตุ')
    // ไม่มี toast ก็ใช้ alert แทน
    if (toastIns) toastIns.show()
    else alert(toastMsg.value)
  } finally {
    placing.value = false
  }
}
</script>
