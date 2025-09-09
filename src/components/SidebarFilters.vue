<template>
  <div class="card p-3" aria-labelledby="filterTitle">
    <h5 id="filterTitle" class="mb-3">Filters</h5>

    <div class="mb-3">
      <label class="form-label">Category</label>
      <select class="form-select" v-model="model.category">
        <option value="">All</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">Brand</label>
      <select class="form-select" v-model="model.brand">
        <option value="">All</option>
        <option v-for="b in brands" :key="b" :value="b">{{ b }}</option>
      </select>
    </div>

    <div class="mb-3">
      <label class="form-label">ช่วงราคา</label>
      <div class="d-flex gap-2">
        <input type="number" class="form-control" v-model.number="model.minPrice" :min="priceRange[0]"
          :max="priceRange[1]" placeholder="Min">
        <input type="number" class="form-control" v-model.number="model.maxPrice" :min="priceRange[0]"
          :max="priceRange[1]" placeholder="Max">
      </div>
      <small class="text-muted">Range: {{ priceRange[0] }} - {{ priceRange[1] }}</small>
    </div>

    <div class="mb-3">
      <label class="form-label">Sort by</label>
      <select class="form-select" v-model="model.sort">
        <option value="">Default</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
      </select>
    </div>

    <button class="btn btn-bw w-100" @click="$emit('apply', { ...model })">Apply</button>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductsStore } from '@/stores/products'

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'apply'])
const products = useProductsStore()
const { categories, brands, priceRange } = storeToRefs(products)

const model = reactive({
  category: '', brand: '', minPrice: 0, maxPrice: 0, sort: ''
})

// sync defaults
const init = computed(() => {
  model.category = props.modelValue.category || ''
  model.brand = props.modelValue.brand || ''
  model.minPrice = props.modelValue.minPrice ?? priceRange.value[0]
  model.maxPrice = props.modelValue.maxPrice ?? priceRange.value[1]
  model.sort = props.modelValue.sort || ''
  return ''
})
</script>
