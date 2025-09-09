<script setup>
import { ref, onMounted, onUnmounted, toRefs } from 'vue'
import { useSearchBox } from '@/composables/useSearch.js'
import { openCartModal } from '@/composables/useCartUI.js'

const props = defineProps({
  brand: { type: String, default: 'ImHereShop' },
  logoSrc: { type: String, default: '/logo.png' },
  cartCount: { type: Number, default: 0 },
})
const { brand, logoSrc, cartCount } = toRefs(props)

const { query, submit } = useSearchBox()
const open = ref(false)
const isDark = ref(false)

function onSearch() { submit(); open.value = false }
function applyTheme(dark) {
  const root = document.documentElement
  root.setAttribute('data-bs-theme', dark ? 'dark' : 'light')
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

function onToggleDark() {
  applyTheme(isDark.value)
}

function toggleDark() {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
  
  // closeProfile()
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  isDark.value = saved ? saved === 'dark' : window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  applyTheme(isDark.value)
})

// ▼ โปรไฟล์: 
const profileOpen = ref(false)
const profileEl = ref(null)
const toggleProfile = () => (profileOpen.value = !profileOpen.value)
const closeProfile = () => (profileOpen.value = false)

const onDocClick = (e) => { if (profileEl.value && !profileEl.value.contains(e.target)) closeProfile() }
const onEsc = (e) => { if (e.key === 'Escape') closeProfile() }
// ▲

const onResize = () => { if (window.innerWidth >= 1024) open.value = false }

onMounted(() => {
  window.addEventListener('resize', onResize)
  document.addEventListener('click', onDocClick, true)
  document.addEventListener('keydown', onEsc)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onDocClick, true)
  document.removeEventListener('keydown', onEsc)
})
</script>

<template>
  <header class="nav">
    <div class="nav__inner">
      <!-- Brand -->
      <router-link class="brand" to="/" aria-label="Home">
        <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="brand__logo" />
        <span class="brand__text">{{ brand }}</span>
      </router-link>

      <!-- Search (desktop) -->
      <form class="search search--desktop" @submit.prevent="onSearch" role="search" aria-label="ค้นหา">
        <input v-model.trim="query" type="search" class="search__input" placeholder="ค้นหา: ชื่อ/แบรนด์/หมวดหมู่"
          aria-label="ค้นหาสินค้า" />
      </form>

      <!-- Actions -->
      <nav class="actions" aria-label="User actions">
        <!-- Cart -->
        <button class="icon-btn" @click="openCartModal()" aria-label="เปิดตะกร้า">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1
               0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.16 14h9.45c.75 0 1.41-.41
               1.75-1.03l3.58-6.49A1 1 0 0 0 21 5H6.21l-.94-2H1v2h3l3.6 7.59-1.35
               2.44C5.52 15.37 6.48 17 8 17h12v-2H8l1.16-1z" />
          </svg>
          <span v-if="cartCount > 0" class="badge" :aria-label="`${cartCount} รายการในตะกร้า`">{{ cartCount }}</span>
        </button>

        <!-- Profile dropdown -->
        <div class="profile" ref="profileEl">
          <button class="icon-btn" @click.stop="toggleProfile" :aria-expanded="profileOpen ? 'true' : 'false'"
            aria-haspopup="menu" aria-controls="profileMenu" aria-label="โปรไฟล์ / เมนูผู้ใช้">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"
              focusable="false">
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z" />
            </svg>
          </button>

          <div id="profileMenu" class="profile__menu" v-show="profileOpen" role="menu">
            <router-link class="profile__item" to="/kpi" role="menuitem" @click="closeProfile()">KPI</router-link>
            <!-- TODO: แก้ path ให้ตรง route จริงของคุณ ถ้าไม่ใช่ /tracking -->
            <router-link class="profile__item" to="/order" role="menuitem" @click="closeProfile()">คำสั่งซื้อ</router-link>
            <!-- สวิตช์ Dark Mode -->
            <!-- แทนที่บล็อก Dark Mode เดิม -->
              <div
                class="profile__item d-flex justify-content-between align-items-center"
                role="menuitemcheckbox"
                :aria-checked="isDark"
                tabindex="0"
                @click="toggleDark"
                @keydown.enter.prevent="toggleDark"
                @keydown.space.prevent="toggleDark"
              >
                <span>Dark Mode</span>
                <div class="form-check form-switch m-0" @click.stop>
                  <input
                    id="darkSwitch"
                    class="form-check-input"
                    type="checkbox"
                    v-model="isDark"
                    @change.stop="onToggleDark"
                  />
                </div>
              </div>
          </div>
        </div>

        <!-- Hamburger (mobile) -->
        <button class="hamburger" @click="open = !open" :aria-expanded="open ? 'true' : 'false'"
          aria-controls="mobileMenu" aria-label="สลับเมนู">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79L20 20.5 21.5 19 15.5 14zM9.5 14a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
          </svg>
        </button>
      </nav>
    </div>

    <!-- Mobile drawer -->
    <div id="mobileMenu" class="mobile" v-show="open">
      <form class="search search--mobile" @submit.prevent="onSearch" role="search" aria-label="ค้นหา">
        <input v-model.trim="query" type="search" class="search__input" placeholder="ค้นหาสินค้า…"
          aria-label="ค้นหาสินค้า" />
      </form>
    </div>
  </header>
</template>

<style scoped>
:root {
  --nav-bg-left: rgba(255, 255, 255, 0.95);
  --nav-bg-right: rgba(224, 242, 254, 0.95);
  --nav-fg: #0b3d5c;
  --nav-ring: rgba(14, 165, 233, 0.45);
}

.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(10px);
  background: linear-gradient(10deg, var(--nav-bg-left), var(--nav-bg-right));
  box-shadow: 0 1px 0 rgba(12, 74, 110, 0.08);
  color: var(--nav-fg);
}

/* ชิดซ้าย–ขวาสุด navbar */
.nav__inner {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 1%;
  margin-top: 8px;
}

/* Search */
.search {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search__input {
  flex: 1 1 auto;
  min-width: 280px;
  height: 38px;
  border: 1px solid rgba(12, 74, 110, .18);
  border-radius: 10px;
  padding: 0 12px;
  outline: none;
  color: #000 !important;
  background: rgba(255, 255, 255, .75);
}

.search__input:focus {
  border-color: var(--nav-ring);
  box-shadow: 0 0 0 3px var(--nav-ring);
}

/* Brand */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  margin-left: 10px;
}

.brand__logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  border-radius: 8px;
}

.brand__text {
  font-weight: 700;
  letter-spacing: .3px;
}

/* Actions */
.actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  justify-self: end;
}

.icon-btn {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid rgba(12, 74, 110, .18);
  background: #fff;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #0284c7;
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

/* Profile dropdown */
.profile {
  position: relative;
}

.profile__menu {
  position: absolute;
  right: 0;
  top: 110%;
  min-width: 180px;
  padding: 8px;
  background: #fff;
  border: 1px solid rgba(12, 74, 110, .18);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(12, 74, 110, .12);
  z-index: 60;
}

.profile__item {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  color: #0b3d5c;
  text-decoration: none;
}

.profile__item:hover,
.profile__item:focus {
  background: rgba(14, 165, 233, .12);
}

/* Mobile search: */
.search--mobile {
  display: flex;
  flex-direction: column;
  align-items: center;     
  gap: 20px;
  padding: 10px 0;
}

.search--mobile .search__input {
  width: min(100%, 560px); 
  margin: 0 auto;          
}

/* Hamburger + Mobile drawer */
.hamburger {
  display: none;
  border: 1px solid rgba(12, 74, 110, .18);
  background: #fff;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  padding: 8px;
}

.mobile {
  padding: 0%;
  margin-inline: auto;
}

/* Responsive */
@media (max-width:1023px) {
  .search--desktop {
    display: none;
  }

  .hamburger {
    display: inline-grid;
    place-items: center;
  }

  .mobile {
    display: block;
  }
}
.profile { position: relative; }

/* ===== Dropdown (เฉพาะกล่องเมนู) – Light ===== */
.profile__menu{
  position: absolute;
  right: 0; top: calc(100% + 8px);
  min-width: 220px;
  background: #ffffff;
  border: 1px solid rgba(2,132,199,.15);
  box-shadow: 0 10px 30px rgba(2,132,199,.10);
  border-radius: 12px;
  padding: 6px;
  z-index: 1000;
}
.profile__item{
  display: flex; align-items: center; justify-content: space-between;
  gap: .75rem;
  color: #0f172a;           /* ข้อความ */
  text-decoration: none;
  background: transparent;
  border-radius: .6rem;
  padding: .625rem .75rem;
  transition: background-color .2s, color .2s, border-color .2s, box-shadow .2s;
}
.profile__item:hover{ background: #f1f5f9; } /* hover เฉพาะในเมนู */

/* ===== เฉพาะตอน Dark Mode  ===== */
html[data-bs-theme="dark"] .profile__menu{
  background: #0f172a;                     
  border-color: rgba(56,189,248,.18);
  box-shadow: 0 10px 30px rgba(14,165,233,.12);
}
html[data-bs-theme="dark"] .profile__item{
  color: #e2e8f0;
}
html[data-bs-theme="dark"] .profile__item:hover{
  background: #111827;                     
}

/* (ทางเลือก) ลูกศรเล็กๆ ใต้ปุ่ม */
.profile__menu::before{
  content: "";
  position: absolute;
  top: -8px; right: 14px;
  border: 8px solid transparent;
  border-bottom-color: currentColor;
  filter: drop-shadow(0 -2px 2px rgba(0,0,0,.06));
  color: rgba(2,132,199,.15);              /* ให้ขอบเข้ากับ border กล่อง */
}
html[data-bs-theme="dark"] .profile__menu::before{
  color: rgba(56,189,248,.18);
}
</style>
