// ค้นหาแบบ Active: ซิงก์ query ↔ URL ?q= อัตโนมัติ + มี submit() ใช้ตอนกด Enter
import { ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

export function useSearchBox() {
  const router = useRouter();
  const route = useRoute();

  const query = ref(typeof route.query.q === "string" ? route.query.q : "");

  // sync จาก URL -> ช่องค้นหา
  watch(
    () => route.query.q,
    (v) => {
      const next = typeof v === "string" ? v : Array.isArray(v) ? v[0] : "";
      if (next !== query.value) query.value = next;
    }
  );

  // debounce อัปเดต URL ระหว่างพิมพ์
  let timer = null;
  watch(query, (v) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = (v || "").trim();
      const dest = { path: "/", query: { q: q || undefined } };

      const curQ =
        typeof route.query.q === "string"
          ? route.query.q
          : Array.isArray(route.query.q)
          ? route.query.q[0]
          : "";
      if (route.path === dest.path && curQ === q) return;

      if (route.path === "/") router.replace(dest);
      else router.push(dest);
    }, 300);
  });

  // ค้นหาแบบ Active
  const submit = (extra = {}) => {
    const q = (query.value || "").trim();
    const dest = { path: "/", query: { ...extra, q: q || undefined } };
    if (route.path === "/") router.replace(dest);
    else router.push(dest);
  };

  const clear = () => {
    query.value = "";
  };

  return { query, submit, clear };
}

export function useKeywordFromRoute() {
  const route = useRoute();
  return computed(() => {
    const v = route.query.q;
    return typeof v === "string" ? v : Array.isArray(v) ? v[0] : "";
  });
}
