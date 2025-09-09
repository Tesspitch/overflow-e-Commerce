import { Modal } from "bootstrap";

let cartModal

const get = (id) => {
  const el = document.getElementById(id);
  if (!el) return null;
  return Modal.getOrCreateInstance?.(el) || new Modal(el);
};



export function openCartModal(){
  const el = document.getElementById('checkoutModal')
  if (!el) return
  cartModal = Modal.getOrCreateInstance(el)
  cartModal.show()
}

export function closeCartModal() {
  const el = document.getElementById("checkoutModal");
  const ins = el ? Modal.getInstance?.(el) : null;
  ins?.hide();
}
