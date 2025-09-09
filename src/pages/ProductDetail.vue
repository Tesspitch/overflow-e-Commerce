<template>
  <div class="bw-container" v-if="product">
    <div class="row g-4">
      <div class="col-12 col-lg-6">
        <img :src="product.image || ph" :alt="product.name" class="img-fluid rounded" />
      </div>
      <div class="col-12 col-lg-6">
        <h3>{{ product.name }}</h3>
        <p class="text-muted">{{ product.brand }} · {{ product.category }}</p>
        <h4 class="mb-3">฿{{ Number(product.price).toLocaleString() }}</h4>
        <p>{{ product.description || '—' }}</p>
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-bw" @click="addToCart(product)">เพิ่มเข้าตะกร้า</button>
        </div>
      </div>
    </div>

    <hr class="my-4" />
    <h5>สินค้าในหมวดเดียวกัน</h5>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
      <div class="col" v-for="p in related" :key="p.id">
        <ProductCard :item="p" @add="addToCart" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const products = useProductsStore()
const cart = useCartStore()
const product = ref(null)
const ph = 'https://placehold.co/800x600?text=Product'

onMounted(async () => {
  if (!products.list.length) { await products.fetch() }
  product.value = products.list.find(p => String(p.id) === route.params.id)
})

const related = computed(() => {
  if (!product.value) return []
  return products.list.filter(p => p.category === product.value.category && p.id !== product.value.id).slice(0, 8)
})

const addToCart = (p) => cart.add(p, 1)
</script>
