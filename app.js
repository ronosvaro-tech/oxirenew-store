// OxiRenew store logic
// Checkout: paste the Payhip product links here once the Payhip account is ready.
const CHECKOUT_LINKS = {
  "1pack": null, // e.g. "https://payhip.com/b/xxxx"
  "2pack": null,
  "3pack": null,
};

const BUNDLES = {
  "1pack": { label: "1-pack", price: "$19.95", off: "50% off" },
  "2pack": { label: "2-pack", price: "$29.95", off: "62% off" },
  "3pack": { label: "3-pack", price: "$39.95", off: "67% off" },
};

let selectedSku = "2pack";

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
// checks out with a smaller pack, offer the next pack once, elegantly.
const UPSELLS = {
  "1pack": {
    to: "2pack",
    body: 'A heads-up before you order: one 100ml bottle restores about <b>one AC unit or one piece of furniture</b>. Planning to whiten more than one item? The 2-pack covers it for just <b>$10 more</b> — one order, one delivery, everything covered.',
    upgrade: "Upgrade to 2-Pack · $29.95",
    decline: "No thanks, 1 bottle is enough",
  },
  "2pack": {
    to: "3pack",
    body: 'Doing the whole house? AC unit, toilet seat <i>and</i> that yellowed furniture — the 3-pack covers it all for just <b>$10 more</b> ($13.32 a bottle, our lowest price).',
    upgrade: "Upgrade to 3-Pack · $39.95",
    decline: "Keep the 2-Pack",
  },
};

const overlay = document.getElementById("upsell-overlay");
let upsellShown = false;

function goToCheckout(sku) {
  const link = CHECKOUT_LINKS[sku];
  if (link) {
    window.location.href = link;
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
  document.getElementById("upsell-upgrade").textContent = offer.upgrade;
  document.getElementById("upsell-decline").textContent = offer.decline;
  overlay.hidden = false;

  document.getElementById("upsell-upgrade").onclick = () => {
    overlay.hidden = true;
    selectBundle(offer.to);
    goToCheckout(offer.to);
  };
  document.getElementById("upsell-decline").onclick = () => {
    overlay.hidden = true;
    goToCheckout(selectedSku);
  };
}

document.getElementById("upsell-close").addEventListener("click", () => { overlay.hidden = true; });
overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.hidden = true; });

// checkout
document.getElementById("checkout-btn").addEventListener("click", () => {
  const offer = UPSELLS[selectedSku];
  if (offer && !upsellShown) {
    upsellShown = true; // ask once per visit — never nag
    showUpsell(offer);
  } else {
    goToCheckout(selectedSku);
  }
});

// FAQ accordion
document.querySelectorAll(".faq-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
    if (!wasOpen) item.classList.add("open");
  });
});
