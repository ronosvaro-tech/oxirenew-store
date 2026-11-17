// OxiRenew store logic
// Checkout: paste the Payhip product links here once the Payhip account is ready.
const CHECKOUT_LINKS = {
  "1pack": "https://payhip.com/b/M2wqu",
  "2pack": "https://payhip.com/b/YR0IS",
  "3pack": "https://payhip.com/b/YZbBm",
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

const PRICES = { "1pack": 19.95, "2pack": 29.95, "3pack": 39.95 };

function goToCheckout(sku) {
  const link = CHECKOUT_LINKS[sku];
  if (window.fbq) {
    fbq("track", "InitiateCheckout", { content_ids: [sku], value: PRICES[sku], currency: "USD" });
  }
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
