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

export const FLOWS = {
  mac_hygiene: "Is my Macintosh okay?",
  clicked_bad_link: "I clicked a suspicious link",
  project_safe: "Is my project safe?",
};

export const VERDICT_COPY = {
  LIKELY_OK: {
    headline: "You're clear.",
    phrases: [
      { gaelic: "Solas", phonetic: "SUH-luss", english: "Light" },
      { gaelic: "Tha thu ceart gu leòr", phonetic: "ha hoo kyart goo LYOR", english: "You're okay enough" },
    ],
  },
  FIX_LIST: {
    headline: "Small fixes. Big calm.",
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
