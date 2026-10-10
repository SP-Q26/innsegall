/**
 * Shared browser telemetry helpers (imported only in docs/tests · duplicated in nav/checkout IIFE for zero extra requests).
 * Keep in sync with web/innsegall-nav.js + web/innsegall-checkout.js.
 */
export const MARKETING_PAGES = new Set([
  "home",
  "alpha",
  "guide",
  "map",
  "boat",
  "clan",
  "warriors",
  "blog",
  "blog_post",
  "privacy",
  "tos",
  "success",
  "install",
  "ios",
  "tablet",
  "watch",
  "companion",
  "supplies",
  "msp",
  "stability",
  "sample",
  "other",
]);

export const PAGE_MAP = {
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

export const REF_CHANNELS = new Set([
  "direct",
  "search",
  "agent",
  "social",
  "warrior",
  "internal",
  "unknown",
]);

export const CHECKOUT_SKUS = new Set(["extra", "clan", "msp"]);
export const INSTALL_ASSETS = new Set(["command", "oneliner", "github"]);
