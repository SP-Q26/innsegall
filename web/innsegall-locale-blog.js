/** EN Field Report · suggest es/pt mirror when browser lang matches (no auto-redirect). */
(function () {
  "use strict";

  var path = location.pathname || "";
  if (!/^\/blog\//.test(path) || path === "/blog" || path === "/blog/") return;

  var slug = path.replace(/^\/blog\//, "").replace(/\/$/, "");
  if (!slug || slug.indexOf("/") >= 0) return;

  function browserLang() {
    var list =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || "en"];
    for (var i = 0; i < list.length; i++) {
      var raw = String(list[i] || "").toLowerCase();
      if (raw.indexOf("es") === 0) return "es";
      if (raw.indexOf("pt") === 0) return "pt";
    }
    return "";
  }

  function altHref(lang) {
    var link = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    return link && link.getAttribute("href") ? link.getAttribute("href") : "";
  }

  var want = browserLang();
  if (!want) return;

  var target = altHref(want);
  if (!target || target === location.href) return;

  var key = "innsegall_lb_" + want + "_" + slug;
  try {
    if (sessionStorage.getItem(key)) return;
  } catch (e) {
    /* continue */
  }

  var labels = {
    es: { lead: "Disponible en español", cta: "Leer en español", dismiss: "Seguir en inglés" },
    pt: { lead: "Disponível em português", cta: "Ler em português", dismiss: "Continuar em inglês" },
  };
  var copy = labels[want];
  if (!copy) return;

  var bar = document.createElement("div");
  bar.className = "locale-blog-suggest";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", copy.lead);
  bar.innerHTML =
    '<p class="locale-blog-suggest__text">' +
    copy.lead +
    ' · <a class="locale-blog-suggest__cta" href="' +
    target +
    '">' +
    copy.cta +
    "</a></p>" +
    '<button type="button" class="locale-blog-suggest__dismiss">' +
    copy.dismiss +
    "</button>";

  bar.querySelector(".locale-blog-suggest__dismiss").addEventListener("click", function () {
    try {
      sessionStorage.setItem(key, "1");
    } catch (e) {
      /* ignore */
    }
    bar.remove();
  });

  var main = document.querySelector("main");
  if (main && main.firstChild) main.insertBefore(bar, main.firstChild);
  else document.body.insertBefore(bar, document.body.firstChild);
})();
