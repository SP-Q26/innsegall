/**
 * Innsegall · eyeglass fades to sword shimmer (WWL through-motion)
 * Canon: docs/GLASS_SWORD_ARRIVAL_LOTTIE.md
 */
(function (global) {
  "use strict";

  if (global.__innGlassArrivalBoot) return;
  global.__innGlassArrivalBoot = true;

  var PLAYER =
    "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
  var ASSET_JSON = "/lottie/inn-glass-arrival-lottie.json";
  var ASSET_FALLBACK = "/lottie/inn-glass-arrival-fallback.svg";
  var ASSET_VER = "1";
  var WALL_MS = 1600;
  var HOLD_MS = 420;
  var SESSION_KEY = "inn_glass_arrival_seen";

  var playerLoading;
  var finished = false;

  function shouldPlay() {
    if (global.document.documentElement.getAttribute("data-inn-glass-arrival") === "off") {
      return false;
    }
    try {
      if (global.sessionStorage.getItem(SESSION_KEY) === "1") return false;
    } catch (e) {
      /* ignore */
    }
    return true;
  }

  function markSeen() {
    try {
      global.sessionStorage.setItem(SESSION_KEY, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function reducedMotion() {
    try {
      return global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      return false;
    }
  }

  function ensureHost() {
    var host = global.document.getElementById("innGlassArrival");
    if (host) return host;
    host = global.document.createElement("div");
    host.id = "innGlassArrival";
    host.className = "inn-glass-arrival";
    host.setAttribute("aria-hidden", "true");
    var glow = global.document.createElement("div");
    glow.className = "inn-glass-arrival__glow";
    glow.setAttribute("aria-hidden", "true");
    var player = global.document.createElement("div");
    player.id = "innGlassPlayer";
    player.className = "inn-glass-arrival__player";
    host.appendChild(glow);
    host.appendChild(player);
    global.document.body.insertBefore(host, global.document.body.firstChild);
    return host;
  }

  function loadPlayer() {
    if (global.customElements && global.customElements.get("dotlottie-player")) {
      return Promise.resolve();
    }
    if (playerLoading) return playerLoading;
    playerLoading = new Promise(function (resolve, reject) {
      var s = global.document.createElement("script");
      s.type = "module";
      s.src = PLAYER;
      s.onload = function () {
        resolve();
      };
      s.onerror = reject;
      global.document.head.appendChild(s);
    });
    return playerLoading;
  }

  function finishHost(host, fast) {
    if (!host || finished) return;
    finished = true;
    markSeen();
    host.classList.add("inn-glass-arrival--done");
    try {
      global.dispatchEvent(new CustomEvent("inn:glass-arrival-complete"));
    } catch (e) {
      /* ignore */
    }
    if (fast) return;
    global.setTimeout(function () {
      if (host.parentNode) host.parentNode.removeChild(host);
    }, 320);
  }

  function mountSvg(host) {
    var mount = host.querySelector("#innGlassPlayer") || host;
    mount.innerHTML = "";
    var img = global.document.createElement("img");
    img.src = ASSET_FALLBACK + "?v=" + ASSET_VER;
    img.alt = "";
    img.decoding = "async";
    img.className = "inn-glass-arrival__svg";
    mount.appendChild(img);
    global.setTimeout(function () {
      finishHost(host, false);
    }, reducedMotion() ? 280 : WALL_MS);
  }

  function mountLottie(host) {
    var mount = host.querySelector("#innGlassPlayer");
    if (!mount) return;
    loadPlayer()
      .then(function () {
        if (finished || host.classList.contains("inn-glass-arrival--done")) return;
        mount.innerHTML = "";
        var el = global.document.createElement("dotlottie-player");
        el.setAttribute("src", ASSET_JSON + "?v=" + ASSET_VER);
        el.setAttribute("autoplay", "");
        el.className = "inn-glass-arrival__lottie";
        mount.appendChild(el);
        var doneTimer = global.setTimeout(function () {
          finishHost(host, false);
        }, WALL_MS + 80);
        el.addEventListener(
          "complete",
          function () {
            global.clearTimeout(doneTimer);
            finishHost(host, false);
          },
          { once: true }
        );
      })
      .catch(function () {
        mountSvg(host);
      });
  }

  function kick() {
    if (finished || !shouldPlay()) return;
    var host = ensureHost();
    if (!host) return;
    host.classList.remove("inn-glass-arrival--done");
    host.style.animationDelay = HOLD_MS + "ms";
    if (reducedMotion()) {
      mountSvg(host);
      return;
    }
    mountLottie(host);
  }

  global.innGlassArrivalKick = kick;
  global.innGlassArrivalFinish = function (fast) {
    finishHost(global.document.getElementById("innGlassArrival"), !!fast);
  };

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", kick);
  } else {
    kick();
  }
})(typeof window !== "undefined" ? window : globalThis);
