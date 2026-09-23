/** Innsegall · header nav highlight + beam signals + anonymous marketing_ping (page category only). */
(function () {
  "use strict";

  var path = location.pathname.replace(/\/$/, "") || "/";

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountBeamSignals, { once: true });
  } else {
    mountBeamSignals();
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
    "/stability": "other",
    "/install": "other",
    "/ios": "other",
    "/tablet": "other",
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
