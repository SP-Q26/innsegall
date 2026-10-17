/** Innsegall blog i18n · locale routing + SEO. */
export const SITE = "https://innsegall.com";

export const LOCALES = {
  es: {
    code: "es",
    htmlLang: "es",
    ogLocale: "es_ES",
    hreflang: "es",
    prefix: "/es",
    translateTarget: "es",
    pickerShort: "ES",
    pickerLabel: "Espa\u00f1ol",
    blogLive: true,
  },
  "pt-BR": {
    code: "pt-BR",
    htmlLang: "pt-BR",
    ogLocale: "pt_BR",
    hreflang: "pt",
    prefix: "/pt",
    translateTarget: "pt",
    pickerShort: "PT",
    pickerLabel: "Portugu\u00eas (Brasil)",
    blogLive: true,
  },
  fr: {
    code: "fr",
    htmlLang: "fr",
    ogLocale: "fr_FR",
    hreflang: "fr",
    prefix: "/fr",
    translateTarget: "fr",
    pickerShort: "FR",
    pickerLabel: "Fran\u00e7ais",
    blogLive: false,
  },
  ar: {
    code: "ar",
    htmlLang: "ar",
    ogLocale: "ar",
    hreflang: "ar",
    prefix: "/ar",
    translateTarget: "ar",
    pickerShort: "AR",
    pickerLabel: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    blogLive: false,
    htmlDir: "rtl",
  },
};

/** Full Field Report blog mirrored under prefix/blog. */
export const LIVE_LOCALE_CODES = ["es", "pt-BR"];

/** Locale home pages at /es · /pt · /fr · /ar. */
export const HOME_LOCALE_CODES = ["es", "pt-BR", "fr", "ar"];
