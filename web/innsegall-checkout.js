/** Innsegall toll gate · Stripe checkout + warrior ref persistence + checkout_intent telemetry */
(function () {
  "use strict";

  var WARRIOR_KEY = "innsegall_warrior_ref";
  var path = location.pathname.replace(/\/$/, "") || "/";

  var PAGE_MAP = {
    "/": "home",
    "/alpha": "alpha",
    "/guide": "guide",
    "/map": "map",
    "/boat": "boat",
    "/clan": "clan",
    "/msp": "msp",
    "/warriors": "warriors",
    "/blog": "blog",
    "/privacy": "privacy",
    "/tos": "tos",
    "/success": "success",
    "/stability": "stability",
    "/install": "install",
    "/ios": "ios",
    "/tablet": "tablet",
    "/watch": "watch",
    "/companion": "companion",
    "/supplies": "supplies",
  };

  function pageCategory() {
    if (PAGE_MAP[path]) return PAGE_MAP[path];
    if (path.indexOf("/blog/") === 0) return "blog_post";
    if (path.indexOf("/samples/") === 0) return "sample";
    return "other";
  }

  function refChannel() {
    var params = new URLSearchParams(location.search);
    if (params.get("ref") && String(params.get("ref")).indexOf("warrior_") === 0) return "warrior";
    var ref = (document.referrer || "").toLowerCase();
    if (!ref) return "direct";
    if (/chatgpt|claude|perplexity|copilot|gemini|openai|anthropic/.test(ref)) return "agent";
    if (/google\.|bing\.|duckduckgo|yahoo\./.test(ref)) return "search";
    if (/twitter|x\.com|facebook|reddit|mastodon|linkedin|threads/.test(ref)) return "social";
    if (ref.indexOf("innsegall.com") >= 0) return "internal";
    return "unknown";
  }

  function sessionId() {
    var key = "innsegall_sid";
    try {
      var existing = localStorage.getItem(key);
      if (existing) return existing;
      var id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "s-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
      return id;
    } catch (e) {
      return "anon";
    }
  }

  function utcDay() {
    return new Date().toISOString().slice(0, 10);
  }

  function sendCheckoutIntent(sku, quantity) {
    var payload = {
      day: utcDay(),
      page: pageCategory(),
      ref_channel: refChannel(),
      session_id: sessionId(),
      sku: sku,
    };
    var ref = warriorRef();
    if (ref) payload.warrior_ref = ref;
    if (sku === "msp" && quantity) payload.quantity = quantity;

    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "checkout_intent", payload: payload }),
      keepalive: true,
    }).catch(function () {});
  }

  function persistWarriorFromUrl() {
    var params = new URLSearchParams(location.search);
    var ref = params.get("ref");
    if (!ref || String(ref).length > 64) return;
    try {
      localStorage.setItem(WARRIOR_KEY, String(ref));
    } catch (e) {
      /* ignore */
    }
  }

  function warriorRef() {
    try {
      return localStorage.getItem(WARRIOR_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function defaultLabel(btn, sku) {
    if (sku === "clan") return "Bring your clan";
    if (sku === "msp") return "Open MSP toll gate";
    return "One panic scout · $4.20";
  }

  async function startCheckout(btn) {
    var sku = btn.getAttribute("data-sku") || "extra";
    var qtyAttr = btn.getAttribute("data-quantity");
    var quantity = qtyAttr ? parseInt(qtyAttr, 10) : undefined;
    if (sku === "msp" && !quantity) {
      var input = document.getElementById("msp-seat-count");
      if (input) quantity = parseInt(input.value, 10) || 10;
    }
    var prev = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Opening the toll gate…";
    sendCheckoutIntent(sku, quantity);
    try {
      var body = { sku: sku, warrior_ref: warriorRef() };
      if (sku === "msp" && quantity) body.quantity = quantity;
      var res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (data.url) location.href = data.url;
      else throw new Error(data.error || "checkout_failed");
    } catch (e) {
      btn.disabled = false;
      btn.textContent = prev || defaultLabel(btn, sku);
      alert(
        "The toll gate stands shut · paid passages are not open on this host yet. Scout free on the alpha field manual."
      );
    }
  }

  window.innsegallStartCheckout = startCheckout;

  persistWarriorFromUrl();

  document.querySelectorAll(".innsegall-checkout").forEach(function (btn) {
    btn.addEventListener("click", function () {
      startCheckout(btn);
    });
  });

  var params = new URLSearchParams(location.search);
  var buy = params.get("buy");
  if (buy === "extra" || buy === "clan" || buy === "msp") {
    var auto = document.querySelector('.innsegall-checkout[data-sku="' + buy + '"]');
    if (auto) startCheckout(auto);
  }
})();
