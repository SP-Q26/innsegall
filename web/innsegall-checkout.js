/** Innsegall toll gate · Stripe checkout + warrior ref persistence */
(function () {
  "use strict";

  var WARRIOR_KEY = "innsegall_warrior_ref";

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
