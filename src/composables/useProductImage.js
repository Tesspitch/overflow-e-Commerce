
import { computed } from "vue";
import { useProductsStore } from "@/stores/products.js";

export function useProductImage() {
  const products = useProductsStore();

  const byId = computed(() => {
    const m = new Map();
    for (const p of products.list || []) m.set(String(p.id), p);
    return m;
  });
  const byName = computed(() => {
    const m = new Map();
    for (const p of products.list || []) {
      if (p?.name) m.set(String(p.name).toLowerCase(), p);
    }
    return m;
  });

  const placeholder = "https://placehold.co/96x96?text=IMG";

  const findProductOfItem = (it) => {
    if (!it) return null;
    const p1 = byId.value.get(String(it.id));
    if (p1) return p1;
    if (it.name) return byName.value.get(String(it.name).toLowerCase()) || null;
    return null;
  };

  const imgForItem = (it) =>
    it?.image || findProductOfItem(it)?.image || placeholder;

  const imagesOfOrder = (order, limit = 3) =>
    (order?.items || []).slice(0, limit).map(imgForItem);

  const ensureProductsLoaded = async () => {
    if (!products.list?.length) {
      try {
        await products.fetch();
      } catch (e) {
        console.warn("[products.fetch] failed", e);
      }
    }
  };

  return { imgForItem, imagesOfOrder, ensureProductsLoaded, placeholder };
}
