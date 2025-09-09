<template>
  <div class="card h-100">
    <img :src="item.image || placeholder" class="card-img-top" :alt="item.name" loading="lazy">
    <div class="card-body d-flex flex-column">
      <h6 class="card-title">{{ item.name }}</h6>
      <p class="text-muted mb-2">{{ item.brand }} · <span class="badge bg-light text-dark">{{ item.category }}</span>
      </p>
      <div class="mt-auto d-flex justify-content-between align-items-center">
        <strong>฿{{ Number(item.price).toLocaleString() }}</strong>
        <div class="btn-group">
          <router-link class="btn btn-outline-primary btn-sm" :to="`/product/${item.id}`">Detail</router-link>
          <button class="btn btn-bw btn-sm" @click="$emit('add', item)">Add</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } })
const placeholder = 'https://placehold.co/600x400?text=Product'
</script>
