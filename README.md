<<<<<<< HEAD
# overflow-e-Commerce
=======
# ImHereShop — ระบบ e‑Commerce (Vue 3 + Pinia + Vue Router + Bootstrap 5)

## ภาพรวมโครงการ
เว็บแอปร้านค้าออนไลน์ที่พัฒนาด้วย **Vue 3 + Vite** ใช้ **Pinia** จัดการสถานะ, **Vue Router** สำหรับเส้นทาง, และ **Bootstrap 5** เพื่อ UI ที่ตอบสนองได้ดีบนอุปกรณ์พกพา โครงการเชื่อมต่อ **REST API** ผ่าน `axios` โดยกำหนดฐาน URL จากไฟล์ `.env` หรือผ่าน `vercel.json` (rewrite → `/api`).

### ฟีเจอร์หลัก
- 
แสดงสินค้า (การ์ดสินค้า, รูป ราคา แบรนด์ หมวดหมู่)- ค้นหา/กรอง: หมวดหมู่, แบรนด์, ช่วงราคา, จัดเรียงราคา- รายละเอียดสินค้า: เส้นทาง /product/:id- ตะกร้าสินค้า: เพิ่ม, ลบ, แก้จำนวน, ยอดรวม (Modal)- ชำระเงิน (Checkout): กรอกข้อมูลผู้ซื้อ, สรุปรายการ, คำนวณราคารวม- ติดตามคำสั่งซื้อ (Tracking) + รายละเอียดออเดอร์- KPI Dashboard เบื้องต้น: ยอดสั่งซื้อ, รายได้รวม, AOV, หมวดหมู่ยอดนิยม- เชื่อมต่อ API ผ่าน axios + baseURL จาก .env / vercel.json rewrite- โครงสร้าง State ด้วย Pinia: products, cart, orders- Vue Router แยกหน้าและมีเส้นทาง fallback 404 → /

## สถาปัตยกรรมและโครงสร้างโค้ด
```
e-Commerce-main/
  .gitignore
  README.md
  index.html
  package-lock.json
  package.json
  vercel.json
  vite.config.js
  .github/
    workflows/
      deploy.yml
  public/
  src/
    App.vue
    main.js
    assets/
      main.css
    components/
      AppNavbar.vue
      CartModal.vue
      KPIWidget.vue
      ProductCard.vue
      SideBar.vue
      SidebarFilters.vue
      VariantPicker.vue
    composables/
      useCartUI.js
      useProductImage.js
      useSearch.js
    pages/
      Checkout.vue
      Home.vue
      KPI.vue
      OrderDetail.vue
      ProductDetail.vue
      Tracking.vue
    router/
      index.js
    services/
      api.js
    stores/
      cart.js
      orders.js
      products.js
    utils/
      product.js
```

โฟลเดอร์สำคัญ:
- `src/services/api.js` – รวมฟังก์ชันเรียก API (axios instance)
- `src/stores/*` – **Pinia stores** สำหรับ `products`, `cart`, `orders`
- `src/pages/*` – หน้าจอหลัก: Home, ProductDetail, Checkout, Tracking, KPI
- `src/components/*` – คอมโพเนนต์ UI เช่น `ProductCard`, `CartModal`, `AppNavbar`
- `src/utils/product.js` – ยูทิลสำหรับสินค้ามีหลายตัวเลือก/สต็อก
- `src/router/index.js` – กำหนดเส้นทางหน้าเว็บ

## การติดตั้งและใช้งาน (Dev)
```bash
# 1) ติดตั้ง
npm install

# 2) รันโหมดพัฒนา
npm run dev

# 3) สร้างไฟล์ผลิต (dist)
npm run build
npm run preview
```
> ต้องมี Node.js เวอร์ชัน 18+ (แนะนำ LTS)

## เส้นทาง (Routes)
- `/` → **home** (คอมโพเนนต์: `@/pages/Home.vue`)
- `/product/:id` → **product** (คอมโพเนนต์: `@/pages/ProductDetail.vue`)
- `/kpi` → **kpi** (คอมโพเนนต์: `@/pages/KPI.vue`)
- `/checkout` → **checkout** (คอมโพเนนต์: `@/pages/Checkout.vue`)
- `/order/:id` → **order-detail** (คอมโพเนนต์: `@/pages/OrderDetail.vue`)
- `/product/:id` → **product** (คอมโพเนนต์: `@/pages/ProductDetail.vue`)
- `/kpi` → **kpi** (คอมโพเนนต์: `@/pages/KPI.vue`)
- `/checkout` → **checkout** (คอมโพเนนต์: `@/pages/Checkout.vue`)
- `/order/:id` → **tracking** (คอมโพเนนต์: `@/pages/Tracking.vue`)

## จุดเชื่อมต่อ API (Services)
ดูที่ `src/services/api.js`:
- `getProducts()` → `GET /ecommerce-products`
- `getProductById(id)` → `GET /ecommerce-products/:id`
- `getOrders()` → `GET /ecommerce-orders`
- `getOrderById(id)` → `GET /ecommerce-orders/:id`
- `createOrder(payload)` → `POST /ecommerce-orders`
- `deleteOrder(id)` → `DELETE /ecommerce-orders/:id`
- `updateOrder(id, payload)` → `PATCH /ecommerce-orders/:id`


## สถานะ (State) และตรรกะสำคัญ
- `stores/products.js`:
  - `getters.categories`, `getters.brands` สร้างชุดหมวดหมู่/แบรนด์จากข้อมูลที่โหลด
  - `actions.fetch()` ดึงสินค้าจาก API พร้อมจัดการสถานะ `loading/error`
- `stores/cart.js`:
  - `getters.count`, `getters.subtotal`
  - ตัวอย่างเมธอด: `add(product, qty)`, `changeQty(id, qty)`, `remove(id)`, `clear()`
- `stores/orders.js`:
  - `getters.kpi` คำนวณ KPI: `totalOrders`, `totalRevenue`, `avgOrderValue`, `topCategory`
  - ตัวอย่างเมธอด: `fetch()`, `getById(id)`, `create(payload)`

## ส่วนประกอบ UI ที่น่าสนใจ
- `components/CartModal.vue` – Modal แสดงตะกร้า/แก้จำนวน/สรุปราคา/ไปชำระเงิน
- `components/ProductCard.vue` – การ์ดสินค้า (รูป/ชื่อ/ราคา/ปุ่มเพิ่มตะกร้า/ปุ่มรายละเอียด)
- `components/KPIWidget.vue` – วิดเจ็ต KPI แสดงค่าสำคัญแบบย่อ
- `components/SidebarFilters.vue` – ฟิลเตอร์หมวดหมู่/แบรนด์/ช่วงราคา
- `composables/useCartUI.js` – ฟังก์ชันเปิด/ปิด Modal ด้วย Bootstrap `Modal`

## แผนพัฒนาต่อ (Roadmap ย่อ)
1. รวม endpoint ให้เป็นมาตรฐานเดียว + สร้างไฟล์ config สำหรับ API
2. เพิ่มการทดสอบอัตโนมัติ (Vitest + Cypress)
3. ปรับปรุง UX โมบาย (โฟกัส/คีย์บอร์ด/ขนาดปุ่ม) และ a11y
4. เพิ่มสถานะ/ขั้นตอนการสั่งซื้อ (processing → paid → shipped → completed)
5. เพิ่มแคช/Prefetch สำหรับหน้า Product/Order
6. รองรับสินค้ามีตัวเลือก (variant) เต็มรูปแบบใน UI

---
จัดทำโดยทีม Dev — มาแล้วครับเพื่อนๆ มาช้าหน่อยแต่ชัดเจน ดีกว่าไม่มาครับ Team
>>>>>>> 8e0f2c4 (chore: initial commit)
