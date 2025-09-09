<template>
  <div>
    <!-- Desktop sidebar -->
    <aside class="bw-sidebar p-3 border-end min-vh-100 d-none d-lg-block sidebar-min">
      <h5 class="mb-3">หมวดหมู่</h5>
      <ul class="list-group">
        <li v-for="cat in categories" :key="cat"
            class="list-group-item list-group-item-action"
            :class="{ active: currentCategory === cat }"
            role="button" @click="go(cat)">
          {{ cat }}
        </li>
      </ul>
    </aside>
    <!-- Mobile Offcanvas -->
    <div class="offcanvas offcanvas-start bw-sidebar" id="catDrawer" tabindex="-1"
         aria-labelledby="catDrawerLabel" ref="drawerEl">
      <div class="offcanvas-header bg-body-tertiary">
        <h5 id="catDrawerLabel" class="mb-0">หมวดหมู่</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="ปิด"></button>
      </div>
      <div class="offcanvas-body p-0">
        <ul class="list-group list-group-flush">
          <li v-for="cat in categories" :key="cat"
              class="list-group-item list-group-item-action"
              :class="{ active: currentCategory === cat }"
              role="button" @click="goFromDrawer(cat)">
            {{ cat }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Offcanvas } from 'bootstrap'

const categories = [
  'ทุกหมวดหมู่', 'อิเล็กทรอนิกส์', 'คอมพิวเตอร์', 'รองเท้า', 'เสื้อผ้า',
  'นาฬิกาและเครื่องประดับ', 'อาหารและเครื่องดื่ม', 'กระเป๋าและสัมภาระ',
  'กล้องและอุปกรณ์ถ่ายภาพ', 'เครื่องใช้ไฟฟ้า', 'สุขภาพและความงาม',
  'เกมและของเล่น', 'กีฬาและนันทนาการ', 'อุปกรณ์คอมพิวเตอร์',
  'แว่นตาและอุปกรณ์', 'เฟอร์นิเจอร์', 'หนังสือ', 'ของใช้ในบ้าน',
  'เครื่องดนตรี', 'ของใช้ในครัว'
]

const route = useRoute()
const router = useRouter()

const currentCategory = computed(() => route.query.category ?? 'ทุกหมวดหมู่')

function go(cat) {
  if (cat === 'ทุกหมวดหมู่') router.push({ name: 'home', query: {} })
  else router.push({ name: 'home', query: { category: cat } })
}

const drawerEl = ref(null)
let drawerIns = null
onMounted(() => {
  if (drawerEl.value) drawerIns = new Offcanvas(drawerEl.value)
})
function goFromDrawer(cat) {
  go(cat)
  drawerIns?.hide()
}
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

.list-group-item.active {
  background: #0ea5e9;
  border-color: #0ea5e9;
  color: #fff;
  font-weight: 600;
}

/* บังคับ min-width เฉพาะ ≥ lg เท่านั้น */
@media (min-width: 992px) {
  .sidebar-min {
    min-width: 190px;
  }
}
</style>
