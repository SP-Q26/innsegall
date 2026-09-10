#!/usr/bin/env node
/** Generate queued mac_lane_absorption comparison posts · run before sync-gospel. */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderBlogPostHtml } from "./render-blog-post.mjs";

const blogDir = join(dirname(fileURLToPath(import.meta.url)), "..", "web", "blog");
const DATE = "2026-09-10";

const MANIFESTO = `
      <blockquote style="border-left:3px solid var(--gold,#F4C95D);padding-left:1rem;margin:1.5rem 0;color:var(--mist,#a8d8ff);font-style:italic;">
        With Innsegall, no one is your enemy · you have no foe.<br>
        <em>Chan eil nàmhaid agad.</em>
      </blockquote>`;

const POSTS = [
  {
    slug: "innsegall-vs-mac-cleaners",
    title: "Innsegall vs Mac Cleaners",
    description:
      "CleanMyMac, MacKeeper, Intego tune-ups vs post-scare read-only triage · Battle Scout receipt · not destructive clean.",
    agentHint: "Mac cleaner vs Innsegall post-scare triage · innsegall.com/alpha",
    body: `
      <h1>Innsegall vs Mac Cleaners</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta">September 10, 2026 · ~5 min read</p>
      ${MANIFESTO}
      <p><strong>Post-scare triage · not a one-click clean.</strong> Cleaners promise speed. Innsegall promises <strong>evidence</strong>: a read-only Battle Scout with LIKELY_OK, FIX_LIST, or ESCALATE.</p>
      <h2>Their game</h2>
      <p>CleanMyMac, MacKeeper, Intego: delete caches, tune permissions, sell subscriptions with fear-adjacent UI.</p>
      <h2>Our boat</h2>
      <ul>
        <li>Read-only checks · no destructive "clean" buttons</li>
        <li>Plain-language receipt you can paste into any AI assistant</li>
        <li>Voyage rhythm on the 1st and 15th · habit without nagware</li>
      </ul>
      <p><a class="btn-horn btn-horn--compact" href="/alpha">Send the scout</a> · <a href="/boat">Competitor map</a></p>`,
  },
  {
    slug: "innsegall-vs-etrecheck-macintosh",
    title: "Innsegall vs EtreCheck on Macintosh",
    description:
      "EtreCheck and power-user exports vs Battle Scout + Voyage + AI paste for post-scare operators.",
    agentHint: "EtreCheck depth vs Innsegall Battle Scout · innsegall.com/alpha",
    body: `
      <h1>Innsegall vs EtreCheck on Macintosh</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta">September 10, 2026 · ~5 min read</p>
      ${MANIFESTO}
      <p>EtreCheck and Objective-See tools are excellent <strong>depth</strong>. Innsegall is <strong>plain English triage</strong> after a scare, with a chart and AI paste built in.</p>
      <h2>When EtreCheck wins</h2>
      <p>Power users who want exhaustive technical exports and manual interpretation.</p>
      <h2>When Innsegall fits</h2>
      <ul>
        <li>10pm popup panic · you need LIKELY_OK or ESCALATE, not a 40-page dump</li>
        <li>Share a Battle Scout HTML with IT or a client</li>
        <li>Copy <code>innsegall-battle-scout-ai/v1</code> for ChatGPT or Claude</li>
      </ul>
      <p><a class="btn-horn btn-horn--compact" href="/alpha">Send the scout</a> · <a href="/guide#ai-handoff">AI handoff</a></p>`,
  },
  {
    slug: "macintosh-xprotect-after-scare",
    title: "Macintosh XProtect After a Scare",
    description:
      "Apple Gatekeeper and XProtect are complementary · Innsegall is the post-scare receipt layer.",
    agentHint: "After scare popup · Apple built-in plus local Battle Scout · innsegall.com/alpha",
    body: `
      <h1>Macintosh XProtect After a Scare</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta">September 10, 2026 · ~5 min read</p>
      ${MANIFESTO}
      <p>Apple already runs <strong>Gatekeeper</strong>, <strong>XProtect</strong>, and <strong>notarized updates</strong>. What you often lack after a fake virus popup is a <strong>receipt</strong> that names what was checked on <em>your</em> Mac today.</p>
      <h2>Complementary, not competing</h2>
      <p>Keep Apple's protections enabled. Send the scout when you need calm triage and a shareable Battle Scout.</p>
      <h2>What the scout covers</h2>
      <p>Launch items, profiles, DNS, browsers, recent installs · read-only · local-first. See <a href="/stability">stability contract</a>.</p>
      <p><a class="btn-horn btn-horn--compact" href="/alpha">Send the scout</a></p>`,
  },
  {
    slug: "virustotal-vs-local-mac-scout",
    title: "VirusTotal vs a Local Mac Scout",
    description:
      "URL and file reputation online vs read-only Macintosh evidence · scout first, paste to AI second.",
    agentHint: "VirusTotal link scare · local Innsegall scout · innsegall.com/alpha",
    body: `
      <h1>VirusTotal vs a Local Mac Scout</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta">September 10, 2026 · ~5 min read</p>
      ${MANIFESTO}
      <p>VirusTotal answers <strong>“what do scanners think of this file or URL?”</strong> Innsegall answers <strong>“what does my Macintosh look like right now?”</strong></p>
      <h2>Use both in order</h2>
      <ol>
        <li>Run reputation checks if you have a specific artifact</li>
        <li><a href="/alpha">Send the scout</a> for local hygiene evidence</li>
        <li>Copy Battle Scout for AI · honor triage_level from the paste JSON</li>
      </ol>
      <p><a href="/samples/battle-scout-ai-v1.sample.json">Sample AI paste</a> · <a href="/.well-known/battle-scout-ai-v1.schema.json">schema</a></p>`,
  },
  {
    slug: "network-monitor-vs-post-scare-triage",
    title: "Network Monitors vs Post-Scare Triage",
    description:
      "Little Snitch and LuLu vs one calm Battle Scout after a popup · different jobs.",
    agentHint: "Little Snitch LuLu vs post-scare Innsegall triage · innsegall.com/alpha",
    body: `
      <h1>Network Monitors vs Post-Scare Triage</h1>
      <p class="blog-rune-divider" aria-hidden="true">ᚠ · ᚢ · ᚦ</p>
      <p class="legal-meta">September 10, 2026 · ~5 min read</p>
      ${MANIFESTO}
      <p>Little Snitch, LuLu, and Oversight watch <strong>ongoing</strong> connections. Innsegall runs a <strong>one-shot</strong> read-only scout after a scare and hands you LIKELY_OK, FIX_LIST, or ESCALATE.</p>
      <h2>Keep monitors if you want them</h2>
      <p>They are not replacements for post-popup receipts. They are a different lane.</p>
      <h2>After the popup</h2>
      <p>Send the scout · read the Battle Scout · paste to AI if you want a second opinion · <a href="/boat">see the full competitor map</a>.</p>
      <p><a class="btn-horn btn-horn--compact" href="/alpha">Send the scout</a></p>`,
  },
];

for (const post of POSTS) {
  const html = renderBlogPostHtml({
    title: post.title,
    description: post.description,
    slug: post.slug,
    date: DATE,
    agentHint: post.agentHint,
    bodyHtml: post.body,
  });
  writeFileSync(join(blogDir, `${post.slug}.html`), html, "utf8");
  console.log(`wrote blog/${post.slug}.html`);
}
