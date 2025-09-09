// src/utils/product.js
export const hasInventory = (p) => !!(p?.inventory && Object.keys(p.inventory).length)

export const variantEntries = (p) =>
  hasInventory(p)
    ? Object.entries(p.inventory).map(([key, v]) => ({ key, ...v }))
    : []

export const firstAvailableVariantKey = (p) => {
  const entries = variantEntries(p)
  if (!entries.length) return null
  const inStock = entries.find(v => (Number(v.stock) || 0) > 0)
  return (inStock?.key ?? entries[0].key)
}

export const priceFor = (p, key) => {
  if (!hasInventory(p)) return Number(p?.price || 0)
  const v = p.inventory?.[key]
  return Number((v?.price ?? p?.price) || 0)
}

export const stockFor = (p, key) => {
  if (!hasInventory(p)) return Number(p?.stock || 0)
  const v = p.inventory?.[key]
  return Number(v?.stock || 0)
}

export const minPrice = (p) => {
  if (!hasInventory(p)) return Number(p?.price || 0)
  const entries = variantEntries(p)
  return Math.min(...entries.map(e => Number(e.price || 0)))
}
