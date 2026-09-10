/**
 * Passage tier CTAs · quota wall + post-scout upsell (ESCALATE / FIX_LIST).
 */
import { PRICING } from "./constants.mjs";

const site = PRICING.site_url;

export function passageUpsellForVerdict(verdict) {
  return verdict === "ESCALATE" || verdict === "FIX_LIST";
}

/** Terminal lines after a successful scout when upsell applies. */
export function formatPassageUpsellTerminal(verdict) {
  if (!passageUpsellForVerdict(verdict)) return "";
  const lead =
    verdict === "ESCALATE"
      ? "Scare months repeat · clan shares Battle Scouts across five seats."
      : "Finish fixes · unlimited scouts on the clan plan if this keeps happening.";
  return [
    "",
    lead,
    `  Panic scout · $${PRICING.extra_run.usd.toFixed(2)} · ${site}/#pricing`,
    `  Clan · $${PRICING.clan.usd_monthly.toFixed(2)}/mo · ${PRICING.clan.seats} seats · ${site}/clan`,
    `  After checkout · innsegall plan --import-license ~/Downloads/innsegall-license.json`,
  ].join("\n");
}

/** Battle Scout HTML block · inserted after Parley on FIX_LIST / ESCALATE. */
export function renderPassageUpsellSection(card) {
  if (!passageUpsellForVerdict(card.verdict)) return "";
  const hot = card.verdict === "ESCALATE";
  const headline = hot ? "Keep a receipt lane open" : "If this keeps happening";
  const dek = hot
    ? "Free Voyages sail the 1st & 15th. After tonight, panic runs or clan seats keep scouts available without another scareware subscription."
    : "You fixed tonight's list. Clan gives unlimited scouts and shared HTML receipts for your roster.";

  return `<section id="passage-tier" class="section passage-upsell${hot ? " passage-upsell--hot" : ""}" aria-labelledby="passage-tier-title">
        <div class="section-label section-label-tier">
          <span class="tier-chip ${hot ? "chip-escalate" : "chip-parley"}">Passage</span>
          <span id="passage-tier-title">Scout quota · calm options</span>
        </div>
        <p class="section-lead">${dek}</p>
        <ul class="passage-tier-list">
          <li><strong>Free</strong> · 2 Voyages on the 1st &amp; 15th · welcome scout once</li>
          <li><strong>Extra scout</strong> · $${PRICING.extra_run.usd.toFixed(2)} one-time</li>
          <li><strong>Clan</strong> · $${PRICING.clan.usd_monthly.toFixed(2)}/mo · ${PRICING.clan.seats} seats · unlimited</li>
        </ul>
        <div class="passage-tier-actions">
          <a class="passage-checkout-btn passage-checkout-btn--secondary" href="${site}/?buy=extra">Panic scout · $${PRICING.extra_run.usd.toFixed(2)}</a>
          <a class="passage-checkout-btn" href="${site}/clan?buy=clan">Clan · $${PRICING.clan.usd_monthly.toFixed(2)}/mo</a>
        </div>
        <p class="muted" style="margin-top:0.75rem;font-size:0.9rem">Not antivirus · read-only triage · you import <code>innsegall-license.json</code> locally after Stripe.</p>
      </section>`;
}
