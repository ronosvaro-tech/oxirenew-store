// OxiRenew help chat — messages are delivered by email via FormSubmit (no backend needed).
(function () {
  const ENDPOINT = "https://formsubmit.co/ajax/ronosvaro@gmail.com";

  const QUICK = [
    "I can't complete checkout",
    "Will it work on my item?",
    "Shipping / order question",
  ];

  const root = document.createElement("div");
  root.className = "oxc";
  root.innerHTML = `
    <button class="oxc-btn" type="button" aria-label="Open help chat" aria-expanded="false">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.9 2 11.7c0 2.4 1.1 4.6 3 6.2L4 22l4.6-2.1c1.1.3 2.2.5 3.4.5 5.5 0 10-3.9 10-8.7S17.5 3 12 3z"/></svg>
      <span class="oxc-btn-label">Need help?</span>
    </button>
    <div class="oxc-panel" role="dialog" aria-label="Help chat" hidden>
      <div class="oxc-head">
        <div><b>OxiRenew Support</b><span>Real people · we reply by email, usually within a few hours</span></div>
        <button class="oxc-x" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="oxc-body">
        <div class="oxc-msg">Hi! 👋 Any question about OxiRenew, or trouble placing your order? Tell us and we'll get right back to you.</div>
        <div class="oxc-quick"></div>
        <form class="oxc-form" novalidate>
          <input class="oxc-in" type="email" name="email" placeholder="Your email (so we can reply)" required autocomplete="email">
          <textarea class="oxc-in" name="message" rows="3" placeholder="Type your message…" required></textarea>
          <input type="text" name="_honey" class="oxc-hp" tabindex="-1" autocomplete="off">
          <button class="oxc-send" type="submit">Send message</button>
          <p class="oxc-err" hidden></p>
        </form>
        <div class="oxc-done" hidden>✅ Thanks — got it! We'll reply to your email shortly.</div>
      </div>
    </div>`;
  document.body.appendChild(root);

  const btn = root.querySelector(".oxc-btn");
  const panel = root.querySelector(".oxc-panel");
  const form = root.querySelector(".oxc-form");
  const msg = form.querySelector("textarea");
  const err = root.querySelector(".oxc-err");
  const quick = root.querySelector(".oxc-quick");

  QUICK.forEach((q) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = q;
    b.addEventListener("click", () => { msg.value = q + ": "; msg.focus(); });
    quick.appendChild(b);
  });

  function setOpen(open) {
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    root.classList.toggle("open", open);
    if (open) setTimeout(() => form.querySelector("input[type=email]").focus(), 50);
  }
  btn.addEventListener("click", () => setOpen(panel.hidden));
  root.querySelector(".oxc-x").addEventListener("click", () => setOpen(false));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.hidden = true;
    const email = form.email.value.trim();
    const text = msg.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = "Please enter a valid email so we can reply."; err.hidden = false; return; }
    if (text.length < 3) { err.textContent = "Please type a message."; err.hidden = false; return; }
    if (form._honey.value) return;
    const send = form.querySelector(".oxc-send");
    send.disabled = true; send.textContent = "Sending…";
    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email, message: text,
          page: location.pathname, _subject: "OxiRenew chat: " + text.slice(0, 50),
          _template: "table", _captcha: "false",
        }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      form.hidden = true; quick.hidden = true;
      root.querySelector(".oxc-done").hidden = false;
      if (window.fbq) fbq("track", "Contact");
    } catch (_) {
      err.textContent = "Sorry, that didn't go through. Please try again in a moment.";
      err.hidden = false;
      send.disabled = false; send.textContent = "Send message";
    }
  });
})();
