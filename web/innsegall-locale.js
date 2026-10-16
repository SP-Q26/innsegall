/** Innsegall · header locale picker · cookie + browser hint (no auto-redirect until guides ship). */
(function () {
  "use strict";

  var COOKIE = "innsegall_locale";
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

  var LOCALES = [
    { code: "en", short: "EN", prefix: "", label: "English", live: true },
    { code: "es", short: "ES", prefix: "/es", label: "Espa\u00f1ol", live: true },
    { code: "pt-BR", short: "PT", prefix: "/pt", label: "Portugu\u00eas (Brasil)", live: true },
    { code: "fr", short: "FR", prefix: "/fr", label: "Fran\u00e7ais", live: false },
    { code: "ar", short: "AR", prefix: "/ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629", live: false },
  ];

  function readCookie(name) {
    var parts = ("; " + document.cookie).split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift() || "";
    return "";
  }

  function writeCookie(name, value) {
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      "; path=/; max-age=" +
      COOKIE_MAX_AGE +
      "; samesite=lax";
  }

  function pathLocale() {
    var p = location.pathname || "/";
    if (p === "/es" || p.indexOf("/es/") === 0) return "es";
    if (p === "/pt" || p.indexOf("/pt/") === 0) return "pt-BR";
    if (p === "/fr" || p.indexOf("/fr/") === 0) return "fr";
    if (p === "/ar" || p.indexOf("/ar/") === 0) return "ar";
    return "en";
  }

  function browserLocaleHint() {
    var list =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var raw = String(list[i] || "").toLowerCase();
      if (!raw) continue;
      if (raw.indexOf("es") === 0) return "es";
      if (raw.indexOf("pt") === 0) return "pt-BR";
      if (raw.indexOf("fr") === 0) return "fr";
      if (raw.indexOf("ar") === 0) return "ar";
    }
    return "en";
  }

  function findLocale(code) {
    for (var i = 0; i < LOCALES.length; i++) {
      if (LOCALES[i].code === code) return LOCALES[i];
    }
    return LOCALES[0];
  }

  function swapPathPrefix(nextPrefix) {
    var path = location.pathname || "/";
    var stripped = path
      .replace(/^\/(es|pt|fr|ar)(\/|$)/, "/")
      .replace(/^\/$/, "");
    if (!stripped.startsWith("/")) stripped = "/" + stripped;
    if (stripped === "/") stripped = "";
    var target = (nextPrefix || "") + (stripped || "/");
    if (location.search) target += location.search;
    location.assign(target);
  }

  var active = findLocale(pathLocale());
  var saved = readCookie(COOKIE);
  if (saved) active = findLocale(saved);
  else if (pathLocale() === "en") {
    var hinted = browserLocaleHint();
    if (hinted !== "en") {
      try {
        sessionStorage.setItem("innsegall_locale_hint", hinted);
      } catch (e) {
        /* ignore */
      }
    }
  }

  window.__INNSEGALL_LOCALE = active.code;
  window.__INNSEGALL_LOCALE_HINT = browserLocaleHint();

  function bindPicker() {
    var root = document.querySelector("[data-locale-picker]");
    if (!root) return;
    var summary = root.querySelector(".locale-picker__trigger");
    if (summary) {
      summary.textContent = active.short;
      summary.setAttribute("aria-label", "Language · " + active.label);
    }
    root.querySelectorAll("[data-locale-code]").forEach(function (btn) {
      var code = btn.getAttribute("data-locale-code");
      var loc = findLocale(code);
      var isActive = loc.code === active.code;
      btn.setAttribute("aria-current", isActive ? "true" : "false");
      if (!loc.live) {
        btn.setAttribute("aria-disabled", "true");
        btn.addEventListener("click", function (ev) {
          ev.preventDefault();
        });
        return;
      }
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        writeCookie(COOKIE, loc.code);
        if (loc.code === pathLocale() || (loc.code === "en" && pathLocale() === "en")) return;
        swapPathPrefix(loc.prefix);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindPicker, { once: true });
  } else {
    bindPicker();
  }
})();
