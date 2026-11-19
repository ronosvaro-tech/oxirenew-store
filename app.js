// OxiRenew store logic
// Checkout: PayPal hosted payment links (account "Dollar IM Dot Com").
// The page offers PayPal, Apple Pay (Safari) and an inline "Debit or Credit
// Card" form — no PayPal account and no popup needed, so it works inside the
// Instagram/Facebook in-app browser. Shipping address is collected there and
// PayPal auto-returns the buyer to /thank-you.html (fires the Purchase pixel).
const CHECKOUT_LINKS = {
  "1pack": "https://www.paypal.com/ncp/payment/TVZR5PEHXZKMG",
  "2pack": "https://www.paypal.com/ncp/payment/UFH5SUA2YJ3H4",
  "3pack": "https://www.paypal.com/ncp/payment/CKHWUZ9T2DJXJ",
};
// Previous Payhip checkout (PayPal-only, no card form) — kept for rollback:
// 1pack M2wqu · 2pack YR0IS · 3pack YZbBm  (https://payhip.com/buy?link=CODE)

const BUNDLES = {
  "1pack": { label: "1-pack", price: "$19.95", off: "50% off" },
  "2pack": { label: "2-pack", price: "$29.95", off: "62% off" },
  "3pack": { label: "3-pack", price: "$39.95", off: "67% off" },
};

let selectedSku = "1pack"; // smallest pack by default - the upsell offers the upgrade

// bundle selection
document.querySelectorAll(".bundle").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".bundle").forEach((b) => b.classList.remove("selected"));
    el.classList.add("selected");
    selectedSku = el.dataset.sku;
    const b = BUNDLES[selectedSku];
    const sticky = document.getElementById("sticky-price");
    if (sticky) sticky.innerHTML = `${b.price} <small>${b.label} · ${b.off}</small>`;
  });
});

// ---- coverage upsell ----
// One 100ml bottle ≈ one AC unit or one piece of furniture. When someone
// checks out with a smaller pack, offer the bigger packs once, elegantly.
// Each option shows its own saving (per-bottle price + $ saved vs buying
// single bottles at $19.95) so the value of each step is obvious.
const PACK_OPTIONS = {
  "2pack": { title: "Home Pack · 2 bottles", price: "$29.95", note: "$14.98/bottle · you save $9.95", tag: "" },
  "3pack": { title: "Whole-House · 3 bottles", price: "$39.95", note: "$13.32/bottle · you save $19.90", tag: "BEST VALUE" },
};
const UPSELLS = {
  "1pack": {
    options: ["2pack", "3pack"],
    body: 'A heads-up before you order: one 100ml bottle restores about <b>one AC unit or one piece of furniture</b>. Planning to whiten more than one item? Bigger packs cost less per bottle — one order, one delivery, everything covered.',
    decline: "No thanks, 1 bottle is enough",
  },
  "2pack": {
    options: ["3pack"],
    body: 'Doing the whole house? AC unit, toilet seat <i>and</i> that yellowed furniture — the 3-pack covers it all for just <b>$10 more</b> ($13.32 a bottle, our lowest price).',
    decline: "Keep the 2-Pack",
  },
};

const overlay = document.getElementById("upsell-overlay");
let upsellShown = false;

const PRICES = { "1pack": 19.95, "2pack": 29.95, "3pack": 39.95 };

function goToCheckout(sku) {
  const link = CHECKOUT_LINKS[sku];
  // remember what was bought so /thank-you.html can report the right Purchase value
  try { localStorage.setItem("oxr_pending", JSON.stringify({ sku, value: PRICES[sku], ts: Date.now() })); } catch (e) {}
  if (window.fbq) {
    fbq("track", "InitiateCheckout", { content_ids: [sku], value: PRICES[sku], currency: "USD" });
  }
  if (link) {
    // give the pixel beacon time to leave before the page unloads
    setTimeout(() => { window.location.href = link; }, window.fbq ? 350 : 0);
  } else {
    alert("Checkout is almost ready — we are launching very soon!");
  }
}

function selectBundle(sku) {
  const el = document.querySelector(`.bundle[data-sku="${sku}"]`);
  if (el) el.click();
}

function showUpsell(offer) {
  document.getElementById("upsell-body").innerHTML = offer.body;
  document.getElementById("upsell-decline").textContent = offer.decline;
  const box = document.getElementById("upsell-options");
  box.innerHTML = "";
  offer.options.forEach((sku) => {
    const o = PACK_OPTIONS[sku];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "upsell-opt" + (o.tag ? " best" : "");
    btn.innerHTML =
      (o.tag ? `<span class="uo-tag">${o.tag}</span>` : "") +
      `<span class="uo-main"><span class="uo-title">${o.title}</span><span class="uo-note">${o.note}</span></span>` +
      `<span class="uo-price">${o.price}</span>`;
    btn.onclick = () => {
      overlay.hidden = true;
      selectBundle(sku);
      goToCheckout(sku);
    };
    box.appendChild(btn);
  });
  overlay.hidden = false;
  overlay.scrollTop = 0; // start at the top so the × is visible

  document.getElementById("upsell-decline").onclick = () => {
    overlay.hidden = true;
    goToCheckout(selectedSku);
  };
}

// Closing the upsell (× or tapping outside) only declines the upgrade — the
// visitor already chose to check out, so continue with the pack they picked.
// (Clarity 19.11: a visitor tapped × and was stranded on the page.)
function declineUpsell() {
  if (overlay.hidden) return;
  overlay.hidden = true;
  goToCheckout(selectedSku);
}
document.getElementById("upsell-close").addEventListener("click", declineUpsell);
overlay.addEventListener("click", (e) => { if (e.target === overlay) declineUpsell(); });

// checkout — the main button and the sticky mobile bar both go straight to checkout
function startCheckout() {
  const offer = UPSELLS[selectedSku];
  if (offer && !upsellShown) {
    upsellShown = true; // ask once per visit — never nag
    showUpsell(offer);
  } else {
    goToCheckout(selectedSku);
  }
}
document.getElementById("checkout-btn").addEventListener("click", startCheckout);
const stickyCheckout = document.getElementById("sticky-checkout");
if (stickyCheckout) stickyCheckout.addEventListener("click", startCheckout);

// Keep the chat bubble, review toast and page padding just above the bottom
// order bar, whatever its real height (large phone fonts make it taller).
const stickyBar = document.querySelector(".sticky-cta");
function setStickyH() {
  if (stickyBar && stickyBar.offsetHeight) {
    document.documentElement.style.setProperty("--sticky-h", stickyBar.offsetHeight + "px");
  }
}
setStickyH();
window.addEventListener("resize", setStickyH);
if (window.ResizeObserver && stickyBar) new ResizeObserver(setStickyH).observe(stickyBar);

// Instagram/Facebook in-app browsers hide Apple Pay. The card form still works
// there, so only show a gentle hint — never force a redirect.
if (/Instagram|FBAN|FBAV/i.test(navigator.userAgent)) {
  const hint = document.getElementById("inapp-hint");
  if (hint) hint.hidden = false;
}

// FAQ accordion
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
    if (!wasOpen) item.classList.add("open");
  });
});

// ---- rotating verified-review toast (real reviews only) ----
const PROOF_REVIEWS = [
  { n: "k***r", t: "“Pure magic! Saved me tons of money on replacements.”", img: "assets/reviews/r04b.png" },
  { n: "o***r", t: "“Wrapped it for 3 days — great results right away!”", img: "assets/reviews/r01b.png" },
  { n: "m***r", t: "“The yellowed areas improved a lot — so much cleaner and brighter.”", img: "assets/reviews/r02b.png" },
  { n: "a***r", t: "“Feels like a new appliance again.”", img: "assets/reviews/r03b.png" },
  { n: "a***r", t: "“Restored my rice cooker shell to bright white.”", img: "assets/reviews/r05b.png" },
  { n: "f***r", t: "“Totally blown away! Strips ugly yellowing off like magic.”", img: "assets/reviews/r09b.png" },
];
(function () {
  const toast = document.getElementById("proof-toast");
  if (!toast) return;
  let i = 0, closed = false, hideTimer = null;
  document.getElementById("proof-close").addEventListener("click", () => {
    closed = true;
    toast.hidden = true;
  });
  function show() {
    if (closed || !overlay.hidden) return; // never over the upsell modal
    const offerBox = document.getElementById("offer").getBoundingClientRect();
    if (offerBox.top < innerHeight && offerBox.bottom > 0) return; // never cover the packs / checkout
    const r = PROOF_REVIEWS[i % PROOF_REVIEWS.length];
    i++;
    document.getElementById("proof-img").src = r.img;
    document.getElementById("proof-text").textContent = r.t;
    document.getElementById("proof-name").textContent = r.n;
    toast.hidden = false;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { toast.hidden = true; }, 7000);
  }
  setTimeout(show, 6000);
  setInterval(show, 22000);
})();
