<template>
  <AppNavbar @open-cart="openCart" />
  <router-view />
  <CartModal />
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import CartModal from '@/components/CartModal.vue'
import SideBar from '@/components/SideBar.vue'
import { Modal } from 'bootstrap'

let modal
const openCart = () => {
  const el = document.getElementById('cartModal')
  if (!modal) modal = new Modal(el)
  modal.show()
}
</script>

