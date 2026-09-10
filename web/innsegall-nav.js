/** Innsegall · header nav highlight + anonymous marketing_ping (page category only). */
(function () {
  "use strict";

  var path = location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".header-nav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    var target = href.replace(/\/$/, "") || "/";
    if (target === path || (target !== "/" && path.startsWith(target))) {
      a.setAttribute("aria-current", "page");
    }
  });

  var PAGE_MAP = {
    "/": "home",
    "/alpha": "alpha",
    "/guide": "guide",
    "/map": "map",
    "/boat": "boat",
    "/clan": "clan",
    "/warriors": "warriors",
    "/blog": "blog",
    "/privacy": "privacy",
    "/tos": "tos",
    "/success": "success",
    "/stability": "other",
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

  function sendMarketingPing() {
    var page = pageCategory();
    var storageKey = "innsegall_mp_" + page + "_" + utcDay();
    try {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    } catch (e) {
      /* continue */
    }

    var params = new URLSearchParams(location.search);
    var warriorRef = params.get("ref");
    var payload = {
      day: utcDay(),
      page: page,
      ref_channel: refChannel(),
      session_id: sessionId(),
    };
    if (warriorRef && String(warriorRef).length <= 64) {
      payload.warrior_ref = String(warriorRef);
    }

    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "marketing_ping", payload: payload }),
      keepalive: true,
    }).catch(function () {});
  }

  if (document.prerendering) {
    document.addEventListener("prerenderingchange", sendMarketingPing, { once: true });
  } else if (document.readyState === "complete") {
    sendMarketingPing();
  } else {
    window.addEventListener("load", sendMarketingPing, { once: true });
  }
})();
