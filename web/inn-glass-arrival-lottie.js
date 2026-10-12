/**
 * Innsegall · eyeglass fades to sword shimmer (WWL through-motion)
 * Canon: docs/GLASS_SWORD_ARRIVAL_LOTTIE.md
 */
(function (global) {
  "use strict";

  if (global.__innGlassArrivalBoot) return;
  global.__innGlassArrivalBoot = true;

  var LOTTIE_WEB =
    "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
  var ASSET_JSON = "/lottie/inn-glass-arrival-lottie.json";
  var ASSET_FALLBACK = "/lottie/inn-glass-arrival-fallback.svg";
  var ASSET_VER = "2";
  var WALL_MS = 1600;
  var HOLD_MS = 420;
  var SESSION_KEY = "inn_glass_arrival_seen";

  var lottieLoading;
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

  function loadLottieWeb() {
    if (global.lottie && global.lottie.loadAnimation) {
      return Promise.resolve();
    }
    if (lottieLoading) return lottieLoading;
    lottieLoading = new Promise(function (resolve, reject) {
      var s = global.document.createElement("script");
      s.src = LOTTIE_WEB;
      s.async = true;
      s.onload = function () {
        if (global.lottie && global.lottie.loadAnimation) resolve();
        else reject(new Error("lottie-web missing"));
      };
      s.onerror = reject;
      global.document.head.appendChild(s);
    });
    return lottieLoading;
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
    loadLottieWeb()
      .then(function () {
        if (finished || host.classList.contains("inn-glass-arrival--done")) return;
        mount.innerHTML = "";
        var anim = global.lottie.loadAnimation({
          container: mount,
          renderer: "svg",
          loop: false,
          autoplay: true,
          path: ASSET_JSON + "?v=" + ASSET_VER,
        });
        var doneTimer = global.setTimeout(function () {
          try {
            anim.destroy();
          } catch (e) {
            /* ignore */
          }
          finishHost(host, false);
        }, WALL_MS + 80);
        anim.addEventListener("complete", function () {
          global.clearTimeout(doneTimer);
          try {
            anim.destroy();
          } catch (e) {
            /* ignore */
          }
          finishHost(host, false);
        });
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
