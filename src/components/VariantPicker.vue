<!-- src/components/VariantPicker.vue -->
<script setup>
import { computed } from 'vue'
import { hasInventory, variantEntries } from '@/utils/product'

const props = defineProps({
  product: { type: Object, required: true },
  modelValue: { type: String, default: '' }, // คีย์รุ่น เช่น '64GB'
  label: { type: String, default: 'ตัวเลือก' }
})
const emit = defineEmits(['update:modelValue'])

const show = computed(() => hasInventory(props.product))
const options = computed(() => variantEntries(props.product))
const current = computed(() => props.modelValue)

const choose = (key) => emit('update:modelValue', key)
</script>

<template>
  <div v-if="show" class="variant-picker">
    <div class="form-label mb-1">{{ label }}</div>
    <div class="d-flex flex-wrap gap-2">
      <button
        v-for="o in options"
        :key="o.key"
        type="button"
        class="btn btn-sm"
        :class="[
          'btn-outline-primary',
          current===o.key && 'active',
          (Number(o.stock) <= 0) && 'disabled'
        ]"
        :disabled="Number(o.stock) <= 0"
        @click="choose(o.key)"
      >
        {{ o.key }} <small class="text-muted" v-if="Number(o.stock)<=0">(หมด)</small>
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn.active { background:#0ea5e9; color:#fff; border-color:#0ea5e9; }
</style>
