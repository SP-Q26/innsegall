/**
 * Field Glass · curated Mac threat brief for Battle Scouts.
 * Full write-up: docs/house-call/blog/
 */

export const BLOG_BASE = "https://innsegall.com/blog";

/** Current featured post (bump slug when publishing a new brief). */
export const FEATURED_POST = {
  slug: "field-glass-sep-2026",
  title: "Field Glass: what Mac threats look like this week",
  published: "2026-09-06",
};

export function featuredPostUrl() {
  return `${BLOG_BASE}/${FEATURED_POST.slug}`;
}

/**
 * Short bullets for the card · not scare copy; tie to Innsegall flows.
 * Sources: Jamf, NCSC-NL, Elastic, IRU (Sep 2026).
 */
export const FIELD_GLASS_BRIEF = {
  asOf: "2026-09-06",
  headline: "Field glass · trending Mac threats",
  dek:
    "Three patterns worth knowing. None of them mean you're infected · they mean know the shape of the fog.",
  items: [
    {
      id: "contagious-interview",
      title: "Fake installers (Contagious Interview)",
      body:
        "Fourteen trojanized DMG/PKG files posing as Sketch, Bartender, The Unarchiver, and similar. Unsigned bundles hide a `.macos` binary or preinstall scripts, then drop OtterCookie · a RAT that grabs browser creds, clipboard, and wallet data.",
      innsegall:
        "If you installed software from a recruiter link or a DMG that asked you to remove quarantine manually · run **I clicked a suspicious link** and Sound the Horn if anything feels off.",
      source: "Jamf Threat Labs",
      sourceUrl: "https://www.jamf.com/blog/contagious-interview-trojanized-macos-installers/",
    },
    {
      id: "screen-sharing-cve",
      title: "Screen Sharing bypass (CVE-2026-65400)",
      body:
        "Apple patched in August, but NCSC-NL and Microsoft still see internet-exposed Macs (port 5900) hit for root access and cryptominers. The bug skips real authentication on Screen Sharing.",
      innsegall:
        "Turn off Screen Sharing unless you need it. Patch to macOS 26.6.1, 15.7.9, or 14.8.9+. We check sharing exposure in hygiene runs.",
      source: "NCSC-NL / Huntress",
      sourceUrl: "https://www.huntress.com/blog/macos-screen-sharing-rce-patched",
    },
    {
      id: "rustbot-supply-chain",
      title: "Rust crate supply chain (Rustbot)",
      body:
        "Malicious releases on crates.io (Aug 20 window) shipped Rustbot on macOS · launch agent persistence, SSH keys, cloud creds, browser stores.",
      innsegall:
        "Developers: if you built Rust projects that day, treat the machine as worth a **project safe** pass · not panic, evidence.",
      source: "IRU",
      sourceUrl: "https://www.iru.com/blog/rustbot-macos-malware",
    },
  ],
  evergreen: {
    title: "Still in the wild: paste-in-Terminal lures",
    body:
      "Fake CAPTCHA and fake job interviews still push `curl | zsh` or “paste this in Terminal.” That is never a normal install step.",
    innsegall:
      "If you pasted a command from a browser prompt · use **clicked_bad_link**. Password entered = escalate.",
  },
};

export function renderThreatIntelSection() {
  const brief = FIELD_GLASS_BRIEF;
  const blogUrl = featuredPostUrl();

  const itemsHtml = brief.items
    .map(
      (item) => `
        <article class="intel-item">
          <h3 class="intel-item-title">${esc(item.title)}</h3>
          <p class="intel-body">${esc(item.body)}</p>
          <p class="intel-innsegall"><strong>Innsegall:</strong> ${formatInline(item.innsegall)}</p>
          <p class="intel-source"><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(item.source)}</a></p>
        </article>`
    )
    .join("");

  const evergreen = brief.evergreen;

  return `<section id="section-intel" class="section section-intel jump-section">
        <div class="section-label section-label-tier">
          <span class="tier-chip chip-intel">Field glass</span>
          <span class="section-label-text">${esc(brief.headline)}</span>
        </div>
        <p class="intel-dek">${esc(brief.dek)}</p>
        <p class="intel-asof">As of ${esc(brief.asOf)} · <a class="intel-blog-link" href="${esc(blogUrl)}" target="_blank" rel="noopener noreferrer">Read on the Innsegall blog →</a></p>
        <div class="intel-grid">${itemsHtml}</div>
        <aside class="intel-evergreen">
          <h3 class="intel-item-title">${esc(evergreen.title)}</h3>
          <p class="intel-body">${esc(evergreen.body)}</p>
          <p class="intel-innsegall"><strong>Innsegall:</strong> ${formatInline(evergreen.innsegall)}</p>
        </aside>
      </section>`;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Allow **bold** in innsegall lines only. */
function formatInline(s) {
  const parts = String(s ?? "").split(/\*\*(.+?)\*\*/g);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    out += i % 2 === 1 ? `<strong>${esc(parts[i])}</strong>` : esc(parts[i]);
  }
  return out;
}
