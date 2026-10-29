/** Innsegall · header nav highlight + beam signals + anonymous marketing_ping (page category only). */
(function () {
  "use strict";

  var path = location.pathname.replace(/\/$/, "") || "/";

  function routeLocaleAndPath() {
    var m = /^\/(es|pt|fr|ar)(\/|$)/.exec(path);
    if (!m) return { routeLocale: "en", logicalPath: path };
    var rest = path.slice(m[1].length + 1) || "/";
    if (rest.charAt(0) !== "/") rest = "/" + rest;
    var code = m[1] === "pt" ? "pt-BR" : m[1];
    return { routeLocale: code, logicalPath: rest };
  }

  var BEAM_NOTES = ["trace", "lane", "ping", "signal", "scout", "event", "follow", "read"];
  var BEAM_ARROWS = ["\u2197", "\u2192", "\u21e2", "\u2198"];

  function beamSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function beamRand(state) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  }

  function mountBeamSignals() {
    var beam = document.querySelector(".beam-bg");
    if (!beam || beam.querySelector(".beam-signals")) return;

    var reduced =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var narrow = typeof innerWidth !== "undefined" && innerWidth < 520;
    var count = reduced ? 3 : narrow ? 4 : 7;
    var layer = document.createElement("div");
    layer.className = "beam-signals";
    layer.setAttribute("aria-hidden", "true");

    var state = beamSeed(path || "/");
    for (var n = 0; n < count; n++) {
      state = (state + n * 9973) >>> 0;
      var r1 = beamRand(state);
      state = (state + 1) >>> 0;
      var r2 = beamRand(state);
      state = (state + 1) >>> 0;
      var r3 = beamRand(state);
      state = (state + 1) >>> 0;
      var r4 = beamRand(state);
      state = (state + 1) >>> 0;
      var r5 = beamRand(state);

      var edge = r1 < 0.5;
      var xPct = edge ? 6 + r2 * 26 : 68 + r2 * 24;
      var yPct = 12 + r3 * 76;

      var el = document.createElement("span");
      el.className = "beam-signal";
      el.style.setProperty("--bx", xPct.toFixed(1) + "%");
      el.style.setProperty("--by", yPct.toFixed(1) + "%");
      el.style.setProperty("--brot", (-28 + r4 * 56).toFixed(0) + "deg");
      el.style.setProperty("--bop", (0.075 + r5 * 0.055).toFixed(3));
      el.style.setProperty("--bdelay", (r3 * 14).toFixed(1) + "s");
      el.style.setProperty("--bdur", (20 + r4 * 16).toFixed(0) + "s");

      state = (state + 11) >>> 0;
      var arrow = BEAM_ARROWS[Math.floor(beamRand(state) * BEAM_ARROWS.length)];
      state = (state + 7) >>> 0;
      var note = BEAM_NOTES[Math.floor(beamRand(state) * BEAM_NOTES.length)];

      var arrowSpan = document.createElement("span");
      arrowSpan.className = "beam-signal-arrow";
      arrowSpan.textContent = arrow;
      var noteSpan = document.createElement("span");
      noteSpan.className = "beam-signal-note";
      noteSpan.textContent = note;
      el.appendChild(arrowSpan);
      el.appendChild(noteSpan);
      layer.appendChild(el);
    }

    beam.appendChild(layer);
  }

  function scheduleBeamSignals() {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(mountBeamSignals, { timeout: 1200 });
    } else {
      setTimeout(mountBeamSignals, 0);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleBeamSignals, { once: true });
  } else {
    scheduleBeamSignals();
  }
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
    var logical = routeLocaleAndPath().logicalPath;
    if (PAGE_MAP[logical]) return PAGE_MAP[logical];
    if (logical === "/blog" || logical.indexOf("/blog/") === 0) return "blog_post";
    if (logical.indexOf("/samples/") === 0) return "sample";
    return "other";
  }

  function blogSlugFromPath() {
    var logical = routeLocaleAndPath().logicalPath;
    if (logical.indexOf("/blog/") !== 0) return "";
    return logical.slice("/blog/".length).split("/")[0].slice(0, 80);
  }

  function activeLocale() {
    return window.__INNSEGALL_LOCALE || routeLocaleAndPath().routeLocale || "en";
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

  function postTelemetry(event, payload) {
    fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: event,
        payload: Object.assign(
          {
            locale: activeLocale(),
            route_locale: routeLocaleAndPath().routeLocale,
          },
          payload || {}
        ),
      }),
      keepalive: true,
    }).catch(function () {});
  }

  function sendMarketingPing() {
    var page = pageCategory();
    var storageKey = "innsegall_mp_" + page + "_" + activeLocale() + "_" + utcDay();
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
    var slug = blogSlugFromPath();
    if (page === "blog_post" && slug) payload.blog_slug = slug;

    postTelemetry("marketing_ping", payload);
  }

  function sendInstallIntent(asset) {
    var page = pageCategory();
    var storageKey = "innsegall_ii_" + asset + "_" + page + "_" + utcDay();
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
      asset: asset,
    };
    if (warriorRef && String(warriorRef).length <= 64) {
      payload.warrior_ref = String(warriorRef);
    }
    postTelemetry("install_intent", payload);
  }

  /** PBS v1 · packet bar on Battle Scout HTML (deduped per event + page per day). */
  function sendPacketBar(event, extra) {
    var allowed = {
      packet_bar_copy_link: 1,
      packet_bar_copy_ai_paste: 1,
      packet_bar_share_html: 1,
      packet_bar_pdf: 1,
    };
    if (!allowed[event]) return;

    var page = pageCategory();
    var storageKey = "innsegall_pb_" + event + "_" + page + "_" + utcDay();
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
    if (extra && typeof extra === "object") {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) payload[k] = extra[k];
      }
    }
    postTelemetry(event, payload);
  }

  window.__innsegallPacketBar = sendPacketBar;

  function wireInstallIntentLinks() {
    document.querySelectorAll('a[href*="Innsegall-Install.command"]').forEach(function (a) {
      a.addEventListener("click", function () {
        sendInstallIntent("command");
      });
    });
    document.querySelectorAll('a[href*="innsegall-alpha-install.sh"]').forEach(function (a) {
      a.addEventListener("click", function () {
        sendInstallIntent("oneliner");
      });
    });
    document.querySelectorAll('a[href*="github.com/SP-Q26/innsegall"]').forEach(function (a) {
      a.addEventListener("click", function () {
        sendInstallIntent("github");
      });
    });
    document.querySelectorAll('a[href*="/samples/battle-scout-demo"]').forEach(function (a) {
      a.addEventListener("click", function () {
        sendInstallIntent("sample_report");
      });
    });
    var heroCopy = document.getElementById("hero-copy-install");
    if (heroCopy) {
      heroCopy.addEventListener("click", function () {
        sendInstallIntent("copy_terminal");
      });
    }
    document.querySelectorAll(".btn-copy[data-copy-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        sendInstallIntent("copy_block");
      });
    });
    document.querySelectorAll("[data-install-intent]").forEach(function (el) {
      el.addEventListener("click", function () {
        var asset = el.getAttribute("data-install-intent") || "copy_terminal";
        sendInstallIntent(asset);
      });
    });
  }

  if (document.prerendering) {
    document.addEventListener("prerenderingchange", sendMarketingPing, { once: true });
  } else if (document.readyState === "complete") {
    sendMarketingPing();
  } else {
    window.addEventListener("load", sendMarketingPing, { once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireInstallIntentLinks, { once: true });
  } else {
    wireInstallIntentLinks();
  }

  function initHomePanicFunnel() {
    var root = document.querySelector("[data-home-panic-funnel]");
    if (!root) return;

    var chips = root.querySelectorAll("[data-device-filter]");
    var panel = root.querySelector("[data-home-scare-panel]");
    var hint = root.querySelector("[data-home-scare-hint]");
    var cards = root.querySelectorAll(".avenue-card[data-device-key]");
    if (!chips.length || !panel || !cards.length) return;

    var storageKey = "innsegall_home_device";

    function matchesFilter(cardKey, filter) {
      if (cardKey === "household") return true;
      return cardKey === filter;
    }

    function applyFilter(filter, focusPanel) {
      chips.forEach(function (chip) {
        var on = chip.getAttribute("data-device-filter") === filter;
        chip.setAttribute("aria-pressed", on ? "true" : "false");
      });

      cards.forEach(function (card) {
        var key = card.getAttribute("data-device-key");
        card.hidden = !matchesFilter(key, filter);
      });

      if (hint) hint.hidden = true;
      panel.hidden = false;

      try {
        sessionStorage.setItem(storageKey, filter);
      } catch (e) {}

      if (focusPanel) {
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        applyFilter(chip.getAttribute("data-device-filter"), true);
      });
    });

    var saved = null;
    try {
      saved = sessionStorage.getItem(storageKey);
    } catch (e2) {}
    if (saved === "iphone" || saved === "ipad" || saved === "mac") {
      applyFilter(saved, false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHomePanicFunnel, { once: true });
  } else {
    initHomePanicFunnel();
  }
})();
