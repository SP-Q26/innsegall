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
export const INSTALL_ASSETS = new Set([
  "command",
  "oneliner",
  "github",
  "copy_terminal",
  "copy_block",
  "sample_report",
]);

/** Packet bar (PBS v1) · web / companion Battle Scout surfaces */
export const PACKET_BAR_EVENTS = new Set([
  "packet_bar_copy_link",
  "packet_bar_copy_ai_paste",
  "packet_bar_share_html",
  "packet_bar_pdf",
]);

export const PACKET_BAR_CONTEXTS = new Set(["battle_scout", "sample_report"]);

export const TRIAGE_LEVELS = new Set(["LIKELY_OK", "FIX_LIST", "ESCALATE"]);

export const AI_PASTE_VER = "innsegall-battle-scout-ai/v1";
