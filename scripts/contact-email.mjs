/** Sitewide contact inbox · Stripe + gospel + footer mailto. */
import { PRICING } from "../src/constants.mjs";

export const CONTACT_EMAIL = PRICING.contact_email;
export const CONTACT_LOCAL = CONTACT_EMAIL.split("@")[0];

export const FOOTER_MAILTO_ANCHOR = `<a class="nav-link nav-link--footer" href="mailto:${CONTACT_EMAIL}" id="footer-tap">${CONTACT_LOCAL}@</a>`;

export const APPLE_TOUCH_LINK =
  `  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180">`;
