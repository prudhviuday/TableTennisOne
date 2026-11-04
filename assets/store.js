(() => {
  "use strict";
  const STORAGE_KEY = "spincraft.cart.v1";
  const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const readCart = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(data) ? data.filter(x => x && typeof x.id === "string" && typeof x.name === "string" && Number.isFinite(Number(x.price)) && Number(x.price) >= 0 && Number(x.quantity) > 0) : [];
    } catch { return []; }
  };
  let items = readCart();
  const summary = () => ({ items: items.reduce((n, x) => n + x.quantity, 0), total: items.reduce((n, x) => n + x.price * x.quantity, 0) });
  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
    render();
    window.dispatchEvent(new CustomEvent("spincraft:cart-updated", { detail: summary() }));
  };
  const open = () => {
    const overlay = document.getElementById("sc-cart-overlay");
    if (overlay) { overlay.classList.add("is-open"); document.body.classList.add("sc-cart-open"); overlay.setAttribute("aria-hidden", "false"); render(); }
  };
  const close = () => {
    const overlay = document.getElementById("sc-cart-overlay");
    if (overlay) { overlay.classList.remove("is-open"); document.body.classList.remove("sc-cart-open"); overlay.setAttribute("aria-hidden", "true"); }
  };
  const add = (product) => {
    if (!product || !product.name || !Number.isFinite(Number(product.price))) return;
    const id = String(product.id || product.sku || (String(product.name) + "-" + Date.now()));
    const existing = items.find(x => x.id === id);
    if (existing) existing.quantity += Math.max(1, Number(product.quantity) || 1);
    else items.push({ id, name: String(product.name), price: Math.max(0, Number(product.price)), quantity: Math.max(1, Number(product.quantity) || 1), details: String(product.details || "") });
    save(); open();
  };
  const changeQuantity = (id, delta) => {
    const item = items.find(x => x.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) items = items.filter(x => x.id !== id);
    save();
  };
  const remove = (id) => { items = items.filter(x => x.id !== id); save(); };
  const render = () => {
    const total = summary();
    document.querySelectorAll("[data-cart-count]").forEach(el => { el.textContent = String(total.items); el.classList.toggle("is-empty", total.items === 0); });
    const list = document.getElementById("sc-cart-items");
    const amount = document.getElementById("sc-cart-total");
    const checkout = document.getElementById("sc-checkout");
    if (!list || !amount || !checkout) return;
    if (!items.length) {
      list.innerHTML = '<div class="sc-empty"><span class="sc-empty-icon">＋</span><strong>Your cart is waiting.</strong><span>Add a blade, rubber or match-day essential to get started.</span><a href="/shop/" class="sc-continue">Explore equipment →</a></div>';
      checkout.disabled = true;
    } else {
      list.innerHTML = items.map(item =>
        '<article class="sc-cart-line"><div class="sc-cart-thumb" aria-hidden="true">SC</div><div class="sc-cart-copy"><strong>' + escapeHTML(item.name) + '</strong>' +
        (item.details ? '<small>' + escapeHTML(item.details) + '</small>' : '') +
        '<span>' + currency.format(item.price) + '</span><div class="sc-quantity"><button type="button" data-cart-qty="' + escapeHTML(item.id) + '" data-delta="-1" aria-label="Decrease quantity">−</button><span>' + item.quantity + '</span><button type="button" data-cart-qty="' + escapeHTML(item.id) + '" data-delta="1" aria-label="Increase quantity">＋</button><button type="button" class="sc-remove" data-cart-remove="' + escapeHTML(item.id) + '">Remove</button></div></div><strong class="sc-line-total">' + currency.format(item.price * item.quantity) + '</strong></article>'
      ).join("");
      checkout.disabled = false;
    }
    amount.textContent = currency.format(total.total);
  };
  const mount = () => {
    if (document.getElementById("sc-cart-overlay")) return;
    const style = document.createElement("style");
    style.textContent = [
      "body.sc-cart-open{overflow:hidden}",
      "#sc-cart-overlay{position:fixed;inset:0;z-index:1000;background:rgba(28,22,20,.48);backdrop-filter:blur(5px);opacity:0;visibility:hidden;transition:opacity .22s,visibility .22s}",
      "#sc-cart-overlay.is-open{opacity:1;visibility:visible}",
      ".sc-cart-drawer{position:absolute;right:0;top:0;height:100%;width:min(470px,100%);background:#fffdfb;display:flex;flex-direction:column;transform:translateX(24px);transition:transform .24s ease;box-shadow:-18px 0 60px rgba(36,25,20,.16)}",
      "#sc-cart-overlay.is-open .sc-cart-drawer{transform:translateX(0)}",
      ".sc-cart-head{padding:24px 25px 20px;border-bottom:1px solid #eee4df;display:flex;align-items:center;justify-content:space-between}",
      ".sc-cart-head small{display:block;color:#8a7770;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:6px}",
      ".sc-cart-head h2{margin:0;font-size:25px;letter-spacing:-.06em;color:#282321}",
      ".sc-cart-close{border:1px solid #eee4df;background:#fff;border-radius:50%;width:38px;height:38px;font-size:21px;color:#6f625c;cursor:pointer}",
      "#sc-cart-items{padding:8px 25px;overflow:auto;flex:1}",
      ".sc-empty{min-height:340px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#8a7770;gap:10px}",
      ".sc-empty-icon{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#fff0e9;color:#c45437;font-size:27px}",
      ".sc-empty strong{font-size:17px;color:#282321}.sc-empty span{max-width:250px;font-size:13px;line-height:1.6}",
      ".sc-continue{color:#b9412d;font-size:13px;font-weight:800;text-decoration:none;margin-top:9px}",
      ".sc-cart-line{display:grid;grid-template-columns:44px 1fr auto;gap:12px;padding:18px 0;border-bottom:1px solid #eee4df;align-items:start}",
      ".sc-cart-thumb{width:44px;height:52px;border-radius:8px;background:linear-gradient(145deg,#f9d7c8,#f4a88b);display:grid;place-items:center;color:#a94730;font-size:11px;font-weight:900;letter-spacing:.08em}",
      ".sc-cart-copy{display:flex;flex-direction:column;gap:5px;min-width:0}.sc-cart-copy strong{font-size:13px;color:#282321}.sc-cart-copy small{font-size:11px;line-height:1.4;color:#8a7770}.sc-cart-copy>span{font-size:12px;color:#665a54}",
      ".sc-line-total{font-size:12px;color:#282321;white-space:nowrap;padding-top:2px}",
      ".sc-quantity{display:flex;align-items:center;gap:9px;margin-top:5px}.sc-quantity button{height:25px;min-width:25px;border:1px solid #e9ddd6;border-radius:6px;background:#fff;color:#514540;cursor:pointer}.sc-quantity span{font-size:12px;color:#514540}.sc-quantity .sc-remove{border:0;color:#b9412d;background:transparent;font-size:11px;margin-left:5px}",
      ".sc-cart-foot{padding:20px 25px 25px;border-top:1px solid #eee4df;background:#fff}.sc-cart-subtotal{display:flex;justify-content:space-between;align-items:center;color:#7d6f69;font-size:13px;margin-bottom:5px}.sc-cart-subtotal strong{font-size:21px;color:#282321;letter-spacing:-.04em}",
      ".sc-cart-note{font-size:11px;line-height:1.5;color:#9a8a83;margin:8px 0 15px}#sc-checkout{width:100%;border:0;border-radius:9px;background:#c84f32;color:white;padding:14px 18px;font-weight:900;font-size:13px;cursor:pointer}#sc-checkout:disabled{opacity:.45;cursor:not-allowed}",
      "[data-cart-count].is-empty{opacity:.75}@media(max-width:480px){.sc-cart-head{padding:20px}.sc-cart-foot{padding:17px 20px 22px}#sc-cart-items{padding:5px 20px}}"
    ].join("");
    document.head.appendChild(style);
    document.body.insertAdjacentHTML("beforeend",
      '<div id="sc-cart-overlay" aria-hidden="true"><aside class="sc-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="sc-cart-title"><div class="sc-cart-head"><div><small>TTgo · Your setup</small><h2 id="sc-cart-title">Your cart <span style="font-size:13px;color:#9a8982;font-weight:600" data-cart-count>0</span></h2></div><button class="sc-cart-close" type="button" data-cart-close aria-label="Close cart">×</button></div><div id="sc-cart-items"></div><div class="sc-cart-foot"><div class="sc-cart-subtotal"><span>Subtotal</span><strong id="sc-cart-total">₹0</strong></div><p class="sc-cart-note">Shipping and taxes are calculated at checkout. Online checkout is not connected in this preview.</p><button id="sc-checkout" type="button">Continue to checkout</button></div></aside></div>'
    );
    render();
  };

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-to-cart]");
    if (addButton) {
      event.preventDefault();
      add({ id: addButton.dataset.productId || addButton.dataset.sku || undefined, name: addButton.dataset.name, price: Number(addButton.dataset.price), details: addButton.dataset.details || "" });
      return;
    }
    if (event.target.closest("[data-cart-open]")) { event.preventDefault(); open(); return; }
    if (event.target.closest("[data-cart-close]") || event.target.id === "sc-cart-overlay") { close(); return; }
    const quantityButton = event.target.closest("[data-cart-qty]");
    if (quantityButton) { changeQuantity(quantityButton.dataset.cartQty, Number(quantityButton.dataset.delta)); return; }
    const removeButton = event.target.closest("[data-cart-remove]");
    if (removeButton) { remove(removeButton.dataset.cartRemove); return; }
    if (event.target.id === "sc-checkout") {
      window.alert("Checkout is not connected yet. The cart is saved in this browser; connect a payment and order service before accepting real orders.");
    }
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  window.SpinCraftCart = { add, open, close, getItems: () => [...items], getSummary: summary };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();