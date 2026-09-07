export const ENGINE_VERSION = "0.4.0-alpha";
export const SCHEMA_VERSION = "1.0";
export const PRODUCT = "innsegall";
/** Customer-facing product name (never internal codenames in user copy). */
export const INNSEGALL_PRODUCT_NAME = "Innsegall";

/** Hero artifact · tired Norseman sends the scout ahead, not the siege */
export const ARTIFACT_NAME = "Battle Scout";
export const ARTIFACT_NAME_PLURAL = "Battle Scouts";
/** @deprecated schema / internal alias only */
export const ARTIFACT_LEGACY = "Incident Card";

/** Claymore cut · replaces em dash in copy and evidence delimiters */
export const CLAYMORE = " · ";

/** Site + CLI CTAs · one primary horn label everywhere */
export const CTA = {
  /** Primary onboarding action (replaces generic "run the check") */
  SEND_SCOUT: "Send the scout",
  SEND_SCOUT_SUB: "Read the lay of the land on your Macintosh · two minutes · no upload",
  COPY_FOR_AI: "Copy Battle Scout for AI",
  COPY_FOR_AI_HINT:
    "Paste into any assistant · ChatGPT, Claude, Gemini, Copilot, DeepSeek · phone, browser, or app",
  COPY_FOR_AI_TOAST:
    "Copied · paste into any AI tab · weaponize your receipt from anywhere",
  FIELD_MANUAL: "Field manual",
  ALPHA_TITLE: "Bring the scout aboard",
  SCOUT_FREE: "Scout free",
};

export const FLOWS = {
  mac_hygiene: "Is my Macintosh okay?",
  clicked_bad_link: "I clicked a suspicious link",
  project_safe: "Is my project safe?",
};

export const VERDICT_COPY = {
  LIKELY_OK: {
    headline: "The mist clears. You're clear.",
    phrases: [
      { gaelic: "Solas", phonetic: "SUH-luss", english: "Light" },
      { gaelic: "Tha thu ceart gu leòr", phonetic: "ha hoo kyart goo LYOR", english: "You're okay enough" },
    ],
  },
  FIX_LIST: {
    headline: "Small deeds. Great calm.",
    phrases: [
      { gaelic: "Slighe soilleir", phonetic: "slee SOIL-yer", english: "A clear path" },
    ],
  },
  ESCALATE: {
    headline: "Sound the Horn.",
    phrases: [
      { gaelic: "Clàradh na adhairce", phonetic: "KLAH-rakh na ADH-ar-khe", english: "Sound the horn" },
      { gaelic: "Thoir thugad do chlann", phonetic: "hor HOO-gad do chlann", english: "Bring your clan" },
    ],
  },
};

/** Human verdict label on Battle Scout (not raw enum). */
export const VERDICT_HUMAN = {
  LIKELY_OK: "You're clear",
  FIX_LIST: "Small deeds",
  ESCALATE: "Needs attention",
};

/** One-line calm-leader voice under the mission summary. */
export const LEADER_LINE = {
  LIKELY_OK: "Breathe. Nothing here needs you tonight.",
  FIX_LIST: "Walk the steps below in order. Clutter, not catastrophe.",
  ESCALATE: "Tonight matters. Start with **Do this now** · Sound the Horn if you want a walk-through.",
};

/** @deprecated use phrases[] · kept for markdown one-liner */
export function gaelicLine(vc) {
  if (!vc?.phrases?.length) return vc?.gaelic || "";
  return vc.phrases.map((p) => p.gaelic).join(" · ");
}

export function gaelicMarkdown(vc) {
  if (!vc?.phrases?.length) return "";
  return vc.phrases.map((p) => `*${p.gaelic}* (${p.phonetic})${CLAYMORE}${p.english}`).join(CLAYMORE);
}

/** Alpha pricing · local quota gate until Stripe */
export const PRICING = {
  site_url: "https://innsegall.com",
  contact_email: "hello@innsegall.com",
  free: {
    label: "Free",
    scouts_per_month: 2,
    note: "2 Voyages on the 1st & 15th · app free",
  },
  extra_run: {
    label: "One run",
    usd: 4.2,
    note: "Extra scout when free quota is used",
  },
  clan: {
    label: "Clan",
    usd_monthly: 6.67,
    seats: 5,
    scouts_per_month: Infinity,
    note: "Unlimited scouts · 5 seats · share with family",
  },
  solas: {
    label: "Solas",
    note: "Static explain from your card · BYOK (Gemini / DeepSeek) for live AI",
  },
  beacon: {
    label: "Beacon",
    note: "Deep Parley via gateway credits",
  },
  parley_cap: { perSession: 3, perDay: 12 },
};
