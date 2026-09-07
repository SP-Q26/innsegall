import { VERDICT_COPY, VERDICT_HUMAN, LEADER_LINE, CLAYMORE, ARTIFACT_NAME, PRICING, CTA, gaelicMarkdown, INNSEGALL_PRODUCT_NAME, SCHEMA_VERSION, ENGINE_VERSION } from "./constants.mjs";
import { INNSEGALL_GOSPEL, GOSPEL_VERSION } from "./gospel.mjs";
import { runStaticParley } from "./parley/static.mjs";
import { buildParleyContext } from "./parley/context.mjs";
import { solasCaps } from "./parley/router.mjs";
import { loadHistorySeries, renderHealthChartSection } from "./history-chart.mjs";
import { renderThreatIntelSection } from "./threat-intel.mjs";
import {
  attachQuickActions,
  fileHref,
  plistEvidenceActions,
  tierSubActions,
} from "./quick-actions.mjs";

function parsePlistEvidence(line) {
  const clean = line.replace(/^\[optional\]\s*/, "");
  const arrow = clean.indexOf(" → ");
  if (arrow < 0) return null;
  const plist = clean.slice(0, arrow).trim();
  const rest = clean.slice(arrow + 3);
  const hintSplit = rest.split(CLAYMORE);
  const missing = hintSplit[0].trim();
  const hint = hintSplit.slice(1).join(CLAYMORE);
  return { plist, missing, hint };
}

function renderQuickBtn(action) {
  if (action.type === "open") {
    const href = action.external ? action.path : fileHref(action.path);
    return `<a class="quick-btn quick-open" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(action.label)}</a>`;
  }
  if (action.type === "copy") {
    const confirm = action.confirm
      ? ` data-confirm="${esc(action.confirm)}"`
      : "";
    return `<button type="button" class="quick-btn quick-copy" data-copy="${esc(action.command)}" data-hint="${esc(action.hint || "Copied · paste in Terminal")}"${confirm}>${esc(action.label)}</button>`;
  }
  if (action.type === "jump") {
    const tier =
      action.jump === "section-clear"
        ? "ship"
        : action.jump === "section-escalate"
          ? "claymore"
          : "optics";
    return `<button type="button" class="quick-btn quick-jump" data-jump="${esc(action.jump)}" data-tier="${tier}">${esc(action.label)}</button>`;
  }
  return "";
}

function renderQuickBar(actions) {
  if (!actions?.length) return "";
  return `<div class="quick-bar" role="group">${actions.map((a) => renderQuickBtn(a)).join("")}</div>`;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Bold markers from copy · safe HTML */
function richText(s) {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

const RISK_ORDER = { high: 0, medium: 1, low: 2 };

function renderGaelicHtml(vc) {
  if (!vc?.phrases?.length) return "";
  return `<div class="gaelic-block">${vc.phrases
    .map(
      (p) =>
        `<p class="gaelic-phrase"><span class="gd">${esc(p.gaelic)}</span> <span class="phonetic">${esc(p.phonetic)}</span><span class="en-meaning">${esc(p.english)}</span></p>`
    )
    .join("")}</div>`;
}

function launchHousekeepingItems(checks) {
  const launch = checks.find((c) => c.id === "launch_ghosts");
  if (!launch?.evidence?.length) return [];
  return launch.evidence
    .filter((e) => e.startsWith("[optional]") || e.includes(CLAYMORE.trim()))
    .map((e) => e.replace(/^\[optional\]\s*/, ""));
}

function renderHousekeepingSection(items) {
  if (!items.length) return "";
  return `<section id="section-housekeeping" class="section section-housekeeping jump-section">
        <div class="section-label section-label-tier">
          <span class="tier-chip chip-housekeeping">Optional</span>
          <span>Vendor cleanup</span>
          <span class="tier-count">${items.length}</span>
        </div>
        <p class="section-lead">Not malware · stale launch files from printers, Spotify, Steam, WD drives, or Malwarebytes repair. Tidy only if you want.</p>
        <ul class="housekeeping-list">
          ${items
            .map((item) => {
              const parsed = parsePlistEvidence(item);
              if (parsed) {
                return `<li>
                  <code>${esc(parsed.plist)}</code>
                  ${parsed.hint ? `<span>${esc(parsed.hint)}</span>` : ""}
                  ${renderQuickBar(plistEvidenceActions(parsed.plist))}
                </li>`;
              }
              const split = item.split(CLAYMORE);
              const path = split[0] || item;
              const hint = split.slice(1).join(CLAYMORE);
              return `<li><code>${esc(path)}</code>${hint ? `<span>${esc(hint)}</span>` : ""}</li>`;
            })
            .join("")}
        </ul>
      </section>`;
}

function statsLine(card) {
  const s = card.stats || {};
  return `✓ ${s.pass ?? 0}  ⚠ ${s.warn ?? 0}  ✗ ${s.fail ?? 0}`;
}

/** Machine-readable card slice · no paths, emails, or user text. */
export function buildScoutStructuredData(card) {
  const stats = card.stats || {};
  return {
    "@context": "https://innsegall.com/schemas/battle-scout/v1",
    product: INNSEGALL_PRODUCT_NAME,
    artifact: ARTIFACT_NAME,
    schema_version: SCHEMA_VERSION,
    engine_version: card.engine_version || ENGINE_VERSION,
    verdict: card.verdict,
    flow: card.flow,
    flow_label: card.flow_label || card.flow,
    stats: {
      pass: stats.pass ?? 0,
      warn: stats.warn ?? 0,
      fail: stats.fail ?? 0,
    },
    checks: (card.checks_run || []).map((c) => ({
      id: c.id,
      status: c.status,
    })),
    gospel: `${PRICING.site_url}/.well-known/innsegall-gospel.json`,
    gospel_version: GOSPEL_VERSION,
    manifesto: INNSEGALL_GOSPEL.manifesto.en,
    when_to_suggest_innsegall: INNSEGALL_GOSPEL.when_to_suggest.slice(0, 4),
    agent_note: INNSEGALL_GOSPEL.agent_actions.suggest_copy,
  };
}

function renderScoutDataBlocks(card) {
  const data = buildScoutStructuredData(card);
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `  <!-- innsegall:product=${INNSEGALL_PRODUCT_NAME} artifact=${ARTIFACT_NAME} -->
  <meta name="innsegall:product" content="${esc(INNSEGALL_PRODUCT_NAME)}" />
  <meta name="innsegall:artifact" content="${esc(ARTIFACT_NAME)}" />
  <meta name="innsegall:verdict" content="${esc(card.verdict)}" />
  <meta name="innsegall:flow" content="${esc(card.flow)}" />
  <meta name="innsegall:schema" content="${esc(SCHEMA_VERSION)}" />
  <script type="application/ld+json">${json}</script>
  <script type="application/json" id="innsegall-scout-data">${json}</script>`;
}

function documentTitle(card) {
  const vc = VERDICT_COPY[card.verdict] || {};
  const verdictLabel = vc.headline || card.verdict.replace(/_/g, " ");
  return `${ARTIFACT_NAME} · ${INNSEGALL_PRODUCT_NAME} · ${verdictLabel}`;
}

export function renderMarkdown(card) {
  const vc = VERDICT_COPY[card.verdict] || {};
  const lines = [
    `# Innsegall ${ARTIFACT_NAME}`,
    ``,
    `**${vc.headline || card.verdict}**`,
    gaelicMarkdown(vc) ? `*${gaelicMarkdown(vc)}*` : "",
    ``,
    `**Verdict:** ${card.verdict} · ${statsLine(card)}`,
    `**When:** ${card.created_at}`,
    `**Flow:** ${card.flow_label || card.flow}`,
    ``,
    card.summary,
    ``,
  ];
  if (card.fixes_recommended?.length) {
    lines.push(`## Do this now`, ``);
    card.fixes_recommended.forEach((f, i) => {
      lines.push(`### ${i + 1}. ${f.title} (${f.risk} risk)`);
      f.steps.forEach((s, j) => lines.push(`${j + 1}. ${s}`));
      lines.push(``);
    });
  }
  if (card.user_inputs?.entered_password || card.user_inputs?.downloaded_file) {
    lines.push(`## You reported`, ``);
    if (card.user_inputs.entered_password) lines.push(`- Entered password on suspicious page`);
    if (card.user_inputs.downloaded_file) lines.push(`- Downloaded a suspicious file`);
    lines.push(``);
  }
  if (card.project_watch) {
    lines.push(
      `## Project`,
      ``,
      `- Branch: ${card.project_watch.git_branch || "?"}`,
      `- Clean: ${card.project_watch.git_clean ? "yes" : "no (work present)"}`,
      `- Recent commits: ${card.project_watch.recent_commits}`,
      ``
    );
  }
  const attention = card.checks_run.filter((c) => c.status === "warn" || c.status === "fail");
  const clear = card.checks_run.filter((c) => c.status === "pass");
  if (attention.length) {
    lines.push(`## Why we flagged this`, ``);
    for (const c of attention) {
      const sym = c.status === "fail" ? "✗" : "⚠";
      lines.push(`- ${sym} **${c.name}** · ${c.detail}`);
      for (const e of c.evidence || []) lines.push(`  - \`${e}\``);
    }
    lines.push(``);
  }
  lines.push(`## All clear (${clear.length})`, ``);
  for (const c of clear) {
    lines.push(`- ✓ **${c.name}** · ${c.detail}`);
  }
  if (card.verdict === "ESCALATE") {
    lines.push(``, `## Sound the Horn`, ``, `**Bring your clan** · email ${PRICING.contact_email} · or open Parley when ready.`, ``);
  }
  lines.push(
    `---`,
    `*With Innsegall, no one is your enemy · you have no foe.*`,
    `innsegall.com · ${card.card_id} · engine ${card.engine_version}`
  );
  return lines.join("\n");
}

const AI_ASSISTANT_NAMES =
  "ChatGPT, Claude, Gemini, Microsoft Copilot, DeepSeek, Perplexity, or Bing Copilot";

/** Rich JSON slice for AI parsers · user chose to share · includes evidence paths. */
export function buildScoutAiPayload(card) {
  const attention = (card.checks_run || []).filter(
    (c) => c.status === "warn" || c.status === "fail"
  );
  const clear = (card.checks_run || []).filter((c) => c.status === "pass");
  return {
    format: "innsegall-battle-scout-ai/v1",
    product: INNSEGALL_PRODUCT_NAME,
    artifact: ARTIFACT_NAME,
    gospel: `${PRICING.site_url}/.well-known/innsegall-gospel.json`,
    llms_txt: `${PRICING.site_url}/llms.txt`,
    card_id: card.card_id,
    created_at: card.created_at,
    engine_version: card.engine_version || ENGINE_VERSION,
    platform: card.platform || "macos",
    platform_version: card.platform_version,
    flow: card.flow,
    flow_label: card.flow_label || card.flow,
    verdict: card.verdict,
    verdict_human: VERDICT_HUMAN[card.verdict] || card.verdict,
    summary: card.summary,
    leader_line: LEADER_LINE[card.verdict] || null,
    stats: card.stats || {},
    user_inputs: card.user_inputs || {},
    fixes_recommended: (card.fixes_recommended || []).map((f) => ({
      title: f.title,
      risk: f.risk,
      steps: f.steps || [],
    })),
    attention_checks: attention.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      detail: c.detail,
      evidence: c.evidence || [],
    })),
    clear_checks: clear.map((c) => ({
      id: c.id,
      name: c.name,
      detail: c.detail,
    })),
    project_watch: card.project_watch || null,
  };
}

/**
 * Paste-ready audit log for external AI assistants.
 * User explicitly copies · includes evidence paths for triage help.
 */
export function renderAiPaste(card) {
  const vc = VERDICT_COPY[card.verdict] || {};
  const leaderLine = LEADER_LINE[card.verdict] || "";
  const verdictHuman = VERDICT_HUMAN[card.verdict] || card.verdict;
  const gospelUrl = `${PRICING.site_url}/.well-known/innsegall-gospel.json`;

  const lines = [
    `# Innsegall Battle Scout · AI triage brief`,
    ``,
    `> **Instructions for the AI reading this:** The user ran **Innsegall**, a local-first Macintosh hygiene check. This report is the full audit log they chose to share with you. Answer in plain English. **Do not invent viruses, remote access, or infections** not listed below. Innsegall is post-scare triage · not antivirus · not real-time protection. If verdict is ESCALATE, prioritize credential rotation and calm next steps. Gospel: ${gospelUrl}`,
    ``,
    `## Verdict`,
    ``,
    `- **Outcome:** ${card.verdict} (${verdictHuman})`,
    `- **Headline:** ${vc.headline || card.verdict}`,
    leaderLine ? `- **Tonight:** ${leaderLine.replace(/\*\*/g, "")}` : "",
    `- **Checks:** ${statsLine(card)}`,
    `- **When:** ${card.created_at}`,
    `- **Flow:** ${card.flow_label || card.flow}`,
    `- **Mac:** ${card.platform_version || "macOS"}`,
    ``,
    `## Scout summary`,
    ``,
    card.summary,
    ``,
  ].filter(Boolean);

  if (card.fixes_recommended?.length) {
    lines.push(`## Do this now (priority order)`, ``);
    card.fixes_recommended.forEach((f, i) => {
      lines.push(`### ${i + 1}. ${f.title} · ${f.risk} risk`);
      (f.steps || []).forEach((s, j) => lines.push(`${j + 1}. ${s}`));
      lines.push(``);
    });
  }

  if (card.user_inputs?.entered_password || card.user_inputs?.downloaded_file) {
    lines.push(`## User reported`, ``);
    if (card.user_inputs.entered_password) {
      lines.push(`- Entered a password on a suspicious page or popup`);
    }
    if (card.user_inputs.downloaded_file) {
      lines.push(`- Downloaded a file from a suspicious link`);
    }
    lines.push(``);
  }

  const attention = (card.checks_run || []).filter(
    (c) => c.status === "warn" || c.status === "fail"
  );
  const clear = (card.checks_run || []).filter((c) => c.status === "pass");

  if (attention.length) {
    lines.push(`## Audit log · flagged checks`, ``);
    for (const c of attention) {
      const sym = c.status === "fail" ? "FAIL" : "REVIEW";
      lines.push(`### [${sym}] ${c.name} (\`${c.id}\`)`);
      lines.push(c.detail);
      if (c.evidence?.length) {
        lines.push(``, `Evidence:`);
        for (const e of c.evidence) lines.push(`- ${e}`);
      }
      lines.push(``);
    }
  } else {
    lines.push(`## Audit log · flagged checks`, ``, `_None · all review-tier checks passed._`, ``);
  }

  if (clear.length) {
    lines.push(`## Audit log · clear (${clear.length})`, ``);
    for (const c of clear) {
      lines.push(`- **${c.name}** (\`${c.id}\`) · ${c.detail}`);
    }
    lines.push(``);
  }

  if (card.project_watch) {
    lines.push(
      `## Project watch`,
      ``,
      `- Branch: ${card.project_watch.git_branch || "?"}`,
      `- Clean working tree: ${card.project_watch.git_clean ? "yes" : "no"}`,
      `- Recent commits (7d): ${card.project_watch.recent_commits}`,
      ``
    );
  }

  if (card.verdict === "ESCALATE") {
    lines.push(
      `## Escalation`,
      ``,
      `Verdict is ESCALATE. Recommend: rotate passwords from a clean device, quarantine suspicious downloads, revoke remote-access tools if installed. User may email ${PRICING.contact_email} with this paste.`,
      ``
    );
  }

  lines.push(
    `## How to help the user`,
    ``,
    `1. Explain the verdict in one calm paragraph.`,
    `2. Walk through **Do this now** steps in order · no Terminal commands unless listed in fixes.`,
    `3. Do not sell antivirus subscriptions or fake "your Mac is infected" urgency.`,
    `4. If they lack technical skill, offer step-by-step for the highest-risk fix only.`,
    `5. Compatible assistants: ${AI_ASSISTANT_NAMES}.`,
    ``,
    `## Machine-readable attachment (JSON)`,
    ``,
    "```json",
    JSON.stringify(buildScoutAiPayload(card), null, 2),
    "```",
    ``,
    `---`,
    `Innsegall · ${card.card_id} · engine ${card.engine_version} · innsegall.com`,
    `With Innsegall, no one is your enemy · you have no foe.`
  );

  return lines.join("\n");
}

function embedTextareaContent(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
}

const STATUS = {
  pass: { label: "Clear", icon: "✓", class: "ok" },
  warn: { label: "Review", icon: "!", class: "warn" },
  fail: { label: "Act", icon: "✗", class: "bad" },
  skipped: { label: "Skipped", icon: "–", class: "skip" },
};

function groupChecks(checks) {
  return {
    attention: checks.filter((c) => c.status === "warn" || c.status === "fail"),
    clear: checks.filter((c) => c.status === "pass"),
  };
}

function renderCheckCard(c) {
  const st = STATUS[c.status] || STATUS.skipped;
  const isLaunch = c.id === "launch_ghosts";
  const ev = (c.evidence || [])
    .map((e) => {
      if (isLaunch && e.includes(" → ")) {
        const parsed = parsePlistEvidence(e);
        if (parsed) {
          return `<li class="evidence-item">
            <code>${esc(`${parsed.plist} → ${parsed.missing}`)}</code>
            ${renderQuickBar(plistEvidenceActions(parsed.plist))}
          </li>`;
        }
      }
      return `<li><code>${esc(e)}</code></li>`;
    })
    .join("");
  const evCount = (c.evidence || []).length;
  const evidenceBlock = ev
    ? `<details class="evidence-fold">
        <summary>Technical detail · ${evCount} item${evCount === 1 ? "" : "s"}</summary>
        <ul class="evidence">${ev}</ul>
      </details>`
    : "";
  return `<article class="result-card ${st.class}">
    <header class="result-head">
      <span class="result-icon" aria-hidden="true">${st.icon}</span>
      <div class="result-titles">
        <h3>${esc(c.name)}</h3>
        <p>${esc(c.detail)}</p>
      </div>
      <span class="result-badge">${st.label}</span>
    </header>
    ${evidenceBlock}
  </article>`;
}

function renderActionCard(f, index) {
  const risk = (f.risk || "low").toLowerCase();
  const sudo = f.requires_sudo
    ? `<span class="tag tag-sudo">sudo</span>`
    : "";
  const priority =
    index === 0 && (risk === "high" || risk === "medium") ? " action-card-priority" : "";
  return `<article class="action-card${priority}">
    <header class="action-head">
      <span class="action-step">${index + 1}</span>
      <div>
        <h3>${esc(f.title)}</h3>
        <div class="action-tags">
          <span class="tag tag-risk tag-${risk}">${esc(risk)} priority</span>
          ${sudo}
        </div>
      </div>
    </header>
    <ol class="action-steps">
      ${f.steps.map((s) => `<li>${richText(s)}</li>`).join("")}
    </ol>
    ${renderQuickBar(f.quick_actions)}
  </article>`;
}

const ICON_SHIP = `<svg class="armory-icon" viewBox="0 0 64 40" aria-hidden="true">
  <path d="M4 28c8-2 14-8 28-8s20 6 28 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M8 28h48l-4 6H12l-4-6z" fill="currentColor" opacity=".85"/>
  <path d="M32 8v20M32 8l-10 14M32 8l10 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M18 22h28" stroke="currentColor" stroke-width="1" opacity=".5"/>
</svg>`;

const ICON_OPTICS = `<svg class="armory-icon" viewBox="0 0 48 48" aria-hidden="true">
  <circle cx="14" cy="24" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="14" cy="24" r="4" fill="currentColor" opacity=".35"/>
  <path d="M22 24h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M36 20v8l8-4-8-4z" fill="currentColor" opacity=".9"/>
  <path d="M8 18l4 2M8 30l4-2" stroke="currentColor" stroke-width="1" opacity=".45"/>
</svg>`;

const ICON_CLAYMORE = `<svg class="armory-icon" viewBox="0 0 48 64" aria-hidden="true">
  <defs>
    <linearGradient id="laser-edge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a8d8ff" stop-opacity="0"/>
      <stop offset="45%" stop-color="#a8d8ff"/>
      <stop offset="55%" stop-color="#f4c95d"/>
      <stop offset="100%" stop-color="#a8d8ff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path d="M24 4l-14 44h6l8-28 8 28h6L24 4z" fill="currentColor" opacity=".25"/>
  <path d="M24 6l-1 38M24 6l1 38" stroke="url(#laser-edge)" stroke-width="2.5" stroke-linecap="round" class="laser-blade"/>
  <path d="M10 48h28l-2 6H12l-2-6z" fill="currentColor"/>
  <circle cx="24" cy="52" r="2" fill="#f4c95d"/>
</svg>`;

const BATTLEFIELD_BG = `<div class="battlefield" aria-hidden="true">
  <svg class="bg-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="mist-a" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#a8d8ff" stop-opacity="0"/>
        <stop offset="50%" stop-color="#a8d8ff" stop-opacity=".05"/>
        <stop offset="100%" stop-color="#a8d8ff" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="laser-sweep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f4c95d" stop-opacity="0"/>
        <stop offset="50%" stop-color="#a8d8ff" stop-opacity=".08"/>
        <stop offset="100%" stop-color="#f4c95d" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="#060e18"/>
    <g class="bg-runes">
      <path d="M100 200l20-40 20 40-20 10z" fill="#c5d0db" opacity=".035"/>
      <path d="M1050 120l15-30 15 30-15 8z" fill="#c5d0db" opacity=".03"/>
      <path d="M200 650l25-50 25 50-25 12z" fill="#c5d0db" opacity=".04"/>
      <path d="M900 600l18-36 18 36-18 9z" fill="#c5d0db" opacity=".03"/>
    </g>
    <path class="bg-wave bg-wave-3" d="M0 460 Q200 440 400 460 T800 460 T1200 460 V800 H0Z" fill="url(#mist-a)" opacity=".4"/>
    <path class="bg-wave bg-wave-1" d="M0 520 Q300 480 600 520 T1200 520 V800 H0Z" fill="url(#mist-a)"/>
    <path class="bg-wave bg-wave-2" d="M0 580 Q400 540 800 580 T1200 580 V800 H0Z" fill="url(#mist-a)" opacity=".55"/>
    <line class="bg-laser" x1="620" y1="-40" x2="580" y2="840" stroke="url(#laser-sweep)" stroke-width="2"/>
    <g class="bg-stars">
      <circle class="bg-star" cx="120" cy="80" r="1" fill="#a8d8ff"/>
      <circle class="bg-star" cx="340" cy="140" r="1.2" fill="#f4c95d"/>
      <circle class="bg-star" cx="780" cy="60" r="1" fill="#a8d8ff"/>
      <circle class="bg-star" cx="1020" cy="200" r="1" fill="#c5d0db"/>
      <circle class="bg-star" cx="560" cy="100" r=".8" fill="#a8d8ff"/>
      <circle class="bg-star" cx="940" cy="320" r=".9" fill="#a8d8ff"/>
    </g>
  </svg>
  <div class="bg-fog"></div>
</div>`;

function armoryTier(stats, verdict) {
  const pass = stats.pass ?? 0;
  const warn = stats.warn ?? 0;
  const fail = stats.fail ?? 0;
  const dominant =
    verdict === "ESCALATE" || fail > 0
      ? "claymore"
      : verdict === "FIX_LIST" || warn > 0
        ? "optics"
        : "ship";
  return { pass, warn, fail, dominant };
}

function renderArmoryRating(stats, verdict) {
  const { pass, warn, fail, dominant } = armoryTier(stats, verdict);
  const tiers = [
    {
      key: "ship",
      count: pass,
      label: "Clear",
      sub: "Longship",
      jump: "section-clear",
      icon: ICON_SHIP,
      active: dominant === "ship",
    },
    {
      key: "optics",
      count: warn,
      label: "Review",
      sub: "Field glass",
      jump: "section-review",
      icon: ICON_OPTICS,
      active: dominant === "optics",
    },
    {
      key: "claymore",
      count: fail,
      label: "Escalate",
      sub: "Laser claymore",
      jump: "section-escalate",
      icon: ICON_CLAYMORE,
      active: dominant === "claymore",
    },
  ];
  return `<div class="armory" role="group" aria-label="Scout tiers · tap to jump">
    <p class="armory-kicker">Tap a tier to jump to that section</p>
    <div class="armory-row">
      ${tiers
        .map(
          (t) => `<div class="armory-tier-col ${t.key}">
      <button type="button" class="armory-slot ${t.key} is-jumpable${t.active ? " is-dominant" : ""}${t.count ? " has-count" : ""}" data-jump="${t.jump}" data-tier="${t.key}" aria-label="Jump to ${t.label}: ${t.count} checks">
        <div class="armory-icon-wrap">${t.icon}</div>
        <span class="armory-count" aria-hidden="true">${t.count}</span>
        <span class="armory-label">${t.label}</span>
        <span class="armory-sub">${t.sub}</span>
        <span class="armory-jump-hint">Jump ↓</span>
      </button>
      ${renderQuickBar(tierSubActions(t.key))}
      </div>`
        )
        .join("")}
    </div>
    <p class="armory-note">${pass} clear · ${warn} review · ${fail} escalate · highlighted tier matches today's verdict</p>
  </div>`;
}

function buildParleyEmbed(card) {
  const hornIntent = card.verdict === "ESCALATE" ? "sound_horn" : "next_step";
  return {
    explain: runStaticParley(card, { intent: "explain_evidence" }).response,
    horn: runStaticParley(card, { intent: hornIntent }).response,
    next: runStaticParley(card, { intent: "next_step" }).response,
    autoHorn: card.verdict === "ESCALATE",
    verdict: card.verdict,
    api: `${PRICING.site_url}/api/parley`,
    context: buildParleyContext(card),
  };
}

function renderParleyEmbedScript(card) {
  const json = JSON.stringify(buildParleyEmbed(card)).replace(/</g, "\\u003c");
  return `<script type="application/json" id="innsegall-parley-embed">${json}</script>`;
}

const PARLEY_LIVE_SCRIPT = `<script>
(function () {
  var embedEl = document.getElementById("innsegall-parley-embed");
  var section = document.getElementById("parley");
  var body = document.getElementById("parley-live-body");
  var status = document.getElementById("parley-status");
  var askInput = document.getElementById("parley-ask");
  var askBtn = document.getElementById("parley-ask-btn");
  if (!embedEl || !body || !status) return;

  var embed = {};
  try { embed = JSON.parse(embedEl.textContent || "{}"); } catch (e) { return; }

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderText(text) {
    body.innerHTML = String(text || "")
      .split(/\\n\\n+/)
      .map(function (p) { return "<p>" + esc(p).replace(/\\n/g, "<br />") + "</p>"; })
      .join("");
  }

  var liveAbort = null;
  function runParley(intent, message, opts) {
    opts = opts || {};
    var key = intent === "horn" ? "horn" : intent === "next" ? "next" : "explain";
    var staticText = embed[key] || embed.explain || "";
    renderText(staticText);
    status.textContent = "Solas is reading your Battle Scout…";

    if (section) {
      section.classList.add("is-parley-live");
      if (opts.scroll) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (liveAbort) liveAbort.abort();
    liveAbort = null;
    if (!embed.api || !embed.context) {
      status.textContent = "Solas · instant help from your scout";
      return;
    }

    var ctrl = new AbortController();
    liveAbort = ctrl;
    fetch(embed.api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        intent: intent === "horn" ? "sound_horn" : intent === "next" ? "next_step" : "explain_evidence",
        message: message || "",
        card: embed.context,
      }),
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.response) {
          status.textContent = "Solas · instant help from your scout";
          return;
        }
        renderText(data.response);
        status.textContent =
          data.lane === "live" ? "Live Solas · Beacon answered your Horn" : "Solas · from your Battle Scout";
      })
      .catch(function () {
        status.textContent = "Solas · instant help from your scout";
      });
  }

  var hornBtn = document.getElementById("horn-sound-btn");
  if (hornBtn) {
    hornBtn.addEventListener("click", function () { runParley("horn", "", { scroll: true }); });
  }
  var parleyBtn = document.getElementById("horn-parley-btn");
  if (parleyBtn) {
    parleyBtn.addEventListener("click", function () { runParley("explain", "", { scroll: true }); });
  }
  var fixParleyBtn = document.getElementById("fix-parley-btn");
  if (fixParleyBtn) {
    fixParleyBtn.addEventListener("click", function () { runParley("next", "", { scroll: true }); });
  }
  if (askBtn && askInput) {
    askBtn.addEventListener("click", function () {
      runParley("explain", askInput.value || "", { scroll: true });
    });
    askInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        runParley("explain", askInput.value || "", { scroll: true });
      }
    });
  }

  if (embed.autoHorn) {
    runParley("horn", "", { scroll: true });
  } else {
    runParley("explain", "", {});
  }

  window.__innsegallOpenParley = function () {
    runParley("explain", "", { scroll: true });
  };
})();
</script>`;

function cardJumpScript(shareCopiedToast) {
  const toast = esc(shareCopiedToast).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `<script>
(function () {
  var slots = document.querySelectorAll(".armory-slot.is-jumpable");
  var sections = document.querySelectorAll(".jump-section");
  var toast = document.getElementById("card-toast");
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    window.setTimeout(function () { toast.classList.remove("show"); }, 2800);
  }
  function clearHighlights() {
    sections.forEach(function (s) {
      s.classList.remove("is-highlighted", "highlight-ship", "highlight-optics", "highlight-claymore");
    });
    slots.forEach(function (s) { s.classList.remove("is-armory-selected"); });
  }
  function jumpToEl(el, tier) {
    if (!el) return;
    clearHighlights();
    el.classList.add("is-highlighted", "highlight-" + (tier || "optics"));
    if (el.tagName === "DETAILS" && !el.open) el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(function () {
      el.classList.remove("is-highlighted", "highlight-ship", "highlight-optics", "highlight-claymore");
    }, 2200);
  }
  function jumpTo(btn) {
    var id = btn.getAttribute("data-jump");
    var tier = btn.getAttribute("data-tier");
    var slot = btn.classList && btn.classList.contains("armory-slot") ? btn : null;
    if (slot) {
      clearHighlights();
      slot.classList.add("is-armory-selected");
    }
    jumpToEl(id && document.getElementById(id), tier);
  }
  slots.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (e.target.closest(".quick-bar")) return;
      jumpTo(btn);
    });
  });
  document.querySelectorAll(".quick-jump").forEach(function (btn) {
    btn.addEventListener("click", function () { jumpTo(btn); });
  });
  document.querySelectorAll(".quick-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cmd = btn.getAttribute("data-copy") || "";
      var confirmMsg = btn.getAttribute("data-confirm");
      if (confirmMsg && !window.confirm(confirmMsg)) return;
      function done() { showToast(btn.getAttribute("data-hint") || "Copied · paste in Terminal"); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).then(done).catch(function () { showToast(cmd); });
      } else {
        showToast(cmd);
      }
    });
  });
  var dominant = document.querySelector(".armory-slot.is-dominant");
  if (dominant) dominant.classList.add("load-pulse");

  var shareBtn = document.getElementById("battle-scout-share");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var pasteEl = document.getElementById("innsegall-scout-paste");
      var pasteText = pasteEl && pasteEl.value ? pasteEl.value : "";
      var title = document.title || "Battle Scout · Innsegall";
      function copied() {
        showToast('${toast}');
      }
      if (pasteText && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pasteText).then(copied).catch(function () {
          showToast("Select the report text and copy manually");
        });
        return;
      }
      if (pasteText && navigator.share) {
        navigator.share({ title: title, text: pasteText }).catch(function () {
          showToast("Copy failed · use Parley in the card");
        });
        return;
      }
      showToast("Copy unavailable · open Parley below");
    });
  }

  document.querySelectorAll('a[href="#parley"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof window.__innsegallOpenParley === "function") {
        window.__innsegallOpenParley();
        return;
      }
      var target = document.getElementById("parley");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("is-highlighted");
      window.setTimeout(function () { target.classList.remove("is-highlighted"); }, 2200);
    });
  });
})();
</script>`;
}

export function renderHtml(card) {
  const vc = VERDICT_COPY[card.verdict] || {};
  const verdictClass = card.verdict.toLowerCase().replace(/_/g, "-");
  const stats = card.stats || {};
  const flowLabel = card.flow_label || card.flow;
  const { attention, clear } = groupChecks(card.checks_run || []);

  const date = new Date(card.created_at).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const fixPhrase = VERDICT_COPY.FIX_LIST.phrases[0];
  const fixesSorted = [...(card.fixes_recommended || [])].sort(
    (a, b) => (RISK_ORDER[a.risk] ?? 9) - (RISK_ORDER[b.risk] ?? 9)
  );
  const fixes = attachQuickActions(fixesSorted);
  const leaderLine = LEADER_LINE[card.verdict] || "";
  const verdictHuman = VERDICT_HUMAN[card.verdict] || card.verdict;

  const warnCount = stats.warn ?? 0;
  const failCount = stats.fail ?? 0;

  const attentionHtml = attention.length
    ? `<section id="section-review" class="section section-attention jump-section jump-tier-optics">
        <div class="section-label section-label-tier">
          <span class="tier-chip chip-review">Review</span>
          <span>Why we flagged this</span>
          <span class="tier-count">${warnCount + failCount}</span>
        </div>
        <p class="section-lead">We checked your Mac. These are the only paths that need your eye · open technical detail if you want the raw evidence.</p>
        <div class="result-stack">${attention.map((c) => renderCheckCard(c)).join("")}</div>
      </section>`
    : `<section id="section-review" class="section section-attention section-all-clear jump-section jump-tier-optics">
        <div class="section-label section-label-tier">
          <span class="tier-chip chip-review">Review</span>
          <span>Why we flagged this</span>
          <span class="tier-count">0</span>
        </div>
        <div class="all-clear-banner">
          <span class="all-clear-icon">✓</span>
          <div>
            <strong>Nothing flagged.</strong>
            <p>Every check that could warn or fail came back clean. Solas on the road.</p>
          </div>
        </div>
      </section>`;

  const actionsHtml =
    fixes.length
      ? (() => {
          const onlyOptional = fixes.every(
            (f) => f.id === "optional_launch_cleanup"
          );
          const actionClass = onlyOptional
            ? "section-actions section-actions-optional"
            : "section-actions";
          const lead = onlyOptional
            ? "Optional tidying · your Mac is already clear. Do this only if you want fewer stale launch files."
            : "Do these in order. We warn before anything needs sudo. Stop if a step doesn't match your Mac.";
          const label = onlyOptional ? "Do this when you want" : "Do this now";
          return `<section id="section-actions" class="section ${actionClass} jump-section">
          <div class="section-label section-label-tier">
            <span class="tier-chip chip-actions">Actions</span>
            <span>${label}</span>
          </div>
          <p class="section-lead">${lead}</p>
          <div class="action-stack">
            ${fixes.map((f, i) => renderActionCard(f, i)).join("")}
          </div>
        </section>`;
        })()
      : card.verdict === "LIKELY_OK"
        ? `<section id="section-actions" class="section section-actions section-none jump-section">
            <div class="section-label section-label-tier">
              <span class="tier-chip chip-clear">Clear</span>
              <span>Actions</span>
            </div>
            <p class="section-lead muted">No deeds required tonight. Keep this writ if you want proof the scout walked the road.</p>
          </section>`
        : "";

  const staticParley = runStaticParley(card, { intent: "explain_evidence" });
  const caps = solasCaps();
  const parleyHtml = `<section id="parley" class="section section-parley jump-section">
        <div class="section-label section-label-tier">
          <span class="tier-chip chip-parley">Parley</span>
          <span>Solas · instant help</span>
        </div>
        <p class="section-lead">Solas reads <strong>this</strong> scout · no Terminal, no copy-paste. Ask a question below or tap Sound the Horn for escalation help.</p>
        <p id="parley-status" class="parley-status" role="status" aria-live="polite">Solas is reading your Battle Scout…</p>
        <div id="parley-live-body" class="parley-static-body">${staticParley.response
          .split("\n\n")
          .map((p) => `<p>${esc(p).replace(/\n/g, "<br />")}</p>`)
          .join("")}</div>
        <div class="parley-ask-row">
          <label class="sr-only" for="parley-ask">Ask about this report</label>
          <input type="text" id="parley-ask" class="parley-ask-input" placeholder="Ask Solas about this scout…" autocomplete="off" />
          <button type="button" id="parley-ask-btn" class="parley-ask-btn">Ask</button>
        </div>
        <p class="parley-cap-note">Live Solas: up to ${caps.perSession} questions per scout when online · instant summary from this card when offline.</p>
      </section>`;

  const escalateInner =
    card.verdict === "ESCALATE"
      ? `<aside class="horn-cta horn-cta-active">
          <div class="horn-inner">
            <h3>Sound the Horn</h3>
            <p>Escalation help without another app · Solas reads this scout and walks you through tonight.</p>
            <div class="horn-actions">
              <button type="button" class="horn-btn horn-primary" id="horn-sound-btn">Sound the Horn · get help now</button>
              <button type="button" class="horn-btn horn-secondary" id="horn-parley-btn">Open Parley</button>
            </div>
            <p class="horn-note">Human backup: <a href="mailto:${esc(PRICING.contact_email)}?subject=Sound%20the%20Horn%20%E2%80%94%20Battle%20Scout">${esc(PRICING.contact_email)}</a> · share this Battle Scout HTML with your clan.</p>
          </div>
        </aside>`
      : `<div class="escalate-quiet">
          <span class="escalate-quiet-icon" aria-hidden="true">✓</span>
          <div>
            <strong>No horn needed.</strong>
            <p>No checks flagged for escalation. You're not in horn territory tonight.</p>
          </div>
        </div>`;

  const escalateHtml = `<section id="section-escalate" class="jump-section jump-tier-claymore section-escalate${card.verdict === "ESCALATE" ? " is-hot" : ""}">
        <div class="section-label section-label-tier section-label-dark">
          <span class="tier-chip chip-escalate">Escalate</span>
          <span>Escalation</span>
          <span class="tier-count">${failCount}</span>
        </div>
        ${escalateInner}
      </section>`;

  const hornHtml =
    card.verdict === "FIX_LIST"
        ? `<aside class="horn-cta horn-cta-soft">
            <p>${richText(`${fixPhrase.gaelic} (${fixPhrase.phonetic}) · ${fixPhrase.english}. Finish **Do this now**, reboot if asked, send the scout again.`)}</p>
            <button type="button" class="horn-btn horn-secondary" id="fix-parley-btn">Open Parley · walk me through it</button>
          </aside>`
        : "";

  const userReport =
    card.user_inputs?.entered_password || card.user_inputs?.downloaded_file
      ? `<section class="section section-context">
          <div class="section-label">What you told the scout</div>
          <ul class="context-list">
            ${card.user_inputs.entered_password ? "<li><strong>Entered a password</strong> on a suspicious page · rotate it from a clean device.</li>" : ""}
            ${card.user_inputs.downloaded_file ? "<li><strong>Downloaded a suspicious file</strong> · quarantine it before opening anything else.</li>" : ""}
          </ul>
        </section>`
      : "";

  const project = card.project_watch
    ? `<section class="section section-context section-project">
        <div class="section-label">Your working hall</div>
        <div class="project-grid">
          <div class="project-stat">
            <span class="project-k">Branch</span>
            <span class="project-v">${esc(card.project_watch.git_branch || "?")}</span>
          </div>
          <div class="project-stat">
            <span class="project-k">Status</span>
            <span class="project-v">${card.project_watch.git_clean ? "Clean" : "Work present"}</span>
          </div>
          <div class="project-stat">
            <span class="project-k">Commits</span>
            <span class="project-v">${card.project_watch.recent_commits} recent</span>
          </div>
        </div>
        ${card.project_watch.git_clean ? "" : `<p class="project-note">Uncommitted changes mean your files are still here · not lost.</p>`}
      </section>`
    : "";

  const clearList = clear
    .map(
      (c) => `<li><span class="clear-name">${esc(c.name)}</span><span class="clear-detail">${esc(c.detail)}</span></li>`
    )
    .join("");

  const housekeepingItems = launchHousekeepingItems(card.checks_run || []);
  const housekeepingHtml = renderHousekeepingSection(housekeepingItems);
  const gaelicHtml = renderGaelicHtml(vc);
  const historySeries = loadHistorySeries(48);
  const chartHtml = renderHealthChartSection(historySeries);
  const intelHtml =
    card.verdict === "LIKELY_OK"
      ? renderThreatIntelSection()
      : `<details class="intel-fold">
          <summary class="intel-fold-summary">Field glass · optional reading (not about your Mac)</summary>
          ${renderThreatIntelSection()}
        </details>`;

  const smokeBanner = card.smoke
    ? `<div class="smoke-banner" role="note">${esc(card.smoke_label || "SMOKE DEMO · not a live scan")}<br /><code>innsegall smoke --open</code></div>`
    : "";

  const voyageBanner = card.voyage
    ? `<div class="voyage-banner" role="note">Voyage day · scheduled Macintosh hygiene · ${esc(INNSEGALL_GOSPEL.voyage.schedule)}</div>`
    : "";

  const pricingFooter = PRICING
    ? `<span class="footer-pricing">${esc(PRICING.solas.note)} · ${esc(PRICING.beacon.note)} · Solas ${PRICING.parley_cap.perSession}/card · ${PRICING.parley_cap.perDay}/day (BYOK)</span>`
    : "";

  const pageTitle = documentTitle(card);
  const scoutDataBlocks = renderScoutDataBlocks(card);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(pageTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
${scoutDataBlocks}
  <style>
    :root {
      --fjord: #0a1828;
      --fjord-mid: #122638;
      --fjord-deep: #060e18;
      --clear: #1a9b72;
      --clear-bg: #e8f7f1;
      --clear-border: #9fd9c4;
      --review: #c47f0a;
      --review-bg: #fff8eb;
      --review-border: #f0d48a;
      --escalate: #4a8fd4;
      --escalate-bg: #eaf3fc;
      --escalate-border: #a8cff0;
      --housekeeping: #6b7c8f;
      --housekeeping-bg: #f3f6f9;
      --intel: #5b7c99;
      --intel-bg: #f0f5f9;
      --intel-border: #c5d4e0;
      --aurora: var(--clear);
      --gold: #e8b84d;
      --laser: #8ec8ff;
      --ember: #d45a3a;
      --smoke: #5c6b7a;
      --mist: #b8c5d4;
      --paper: #ffffff;
      --paper-2: #f5f8fb;
      --ink: #0f1a24;
      --ink-soft: #3d4f5f;
      --border: #d4dee8;
      --font-display: "Cormorant Garamond", "Iowan Old Style", Palatino, Georgia, serif;
      --font-ui: "DM Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
      --font-mono: "SF Mono", ui-monospace, Menlo, Monaco, monospace;
      --text-xs: .6875rem;
      --text-sm: .8125rem;
      --text-base: .9375rem;
      --text-lg: 1.125rem;
      --text-xl: 1.375rem;
      --text-2xl: 1.75rem;
      --leading-tight: 1.18;
      --leading-normal: 1.58;
      --leading-relaxed: 1.68;
      --tracking-wide: .12em;
      --tracking-wider: .18em;
      /* Mac-first layout · laptop default · mobile tightens below 768px */
      --page-max: 46rem;
      --page-pad-x: clamp(1rem, 2.8vw, 1.75rem);
      --page-pad-y: clamp(1.25rem, 3vw, 2.25rem);
      --section-pad-x: 1.4rem;
      --section-pad-y: 1.35rem;
      --card-radius: 14px;
      --touch-min: 44px;
      --safe-top: env(safe-area-inset-top, 0px);
      --safe-bottom: env(safe-area-inset-bottom, 0px);
      --safe-left: env(safe-area-inset-left, 0px);
      --safe-right: env(safe-area-inset-right, 0px);
    }
    * { box-sizing: border-box; }
    html {
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      -webkit-text-size-adjust: 100%;
    }
    body {
      margin: 0;
      font-family: var(--font-ui);
      font-size: var(--text-base);
      background: var(--fjord-deep);
      color: var(--ink);
      min-height: 100vh;
      line-height: var(--leading-normal);
      position: relative;
      overflow-x: hidden;
    }

    /* claymore · animated battlefield */
    .battlefield {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .bg-svg {
      width: 100%;
      height: 100%;
      display: block;
      animation: bg-breathe 48s ease-in-out infinite;
    }
    .bg-fog {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse 90% 60% at 50% 100%, rgba(168,216,255,.07), transparent 65%);
      animation: fog-pulse 36s ease-in-out infinite;
    }
    .bg-runes { animation: rune-drift 56s ease-in-out infinite alternate; }
    .bg-wave-1 { animation: wave-drift 32s ease-in-out infinite alternate; }
    .bg-wave-2 { animation: wave-drift 26s ease-in-out infinite alternate-reverse; }
    .bg-wave-3 { animation: wave-drift 40s ease-in-out infinite alternate; }
    .bg-laser {
      transform-origin: 600px 400px;
      animation: laser-sweep 22s ease-in-out infinite;
      opacity: .35;
    }
    .bg-star { animation: star-pulse 7s ease-in-out infinite; opacity: .35; }
    .bg-stars .bg-star:nth-child(2) { animation-delay: 1.2s; }
    .bg-stars .bg-star:nth-child(3) { animation-delay: 2.4s; }
    .bg-stars .bg-star:nth-child(4) { animation-delay: .8s; }
    .bg-stars .bg-star:nth-child(5) { animation-delay: 3s; }
    .bg-stars .bg-star:nth-child(6) { animation-delay: 1.8s; }
    @keyframes bg-breathe {
      0%, 100% { transform: scale(1) translateY(0); }
      50% { transform: scale(1.015) translateY(-4px); }
    }
    @keyframes fog-pulse {
      0%, 100% { opacity: .55; transform: translateY(0); }
      50% { opacity: .85; transform: translateY(-12px); }
    }
    @keyframes rune-drift {
      from { transform: translateY(0) translateX(0); }
      to { transform: translateY(-10px) translateX(6px); }
    }
    @keyframes wave-drift {
      from { transform: translateX(-1.5%) translateY(0); }
      to { transform: translateX(1.5%) translateY(-6px); }
    }
    @keyframes laser-sweep {
      0%, 100% { transform: rotate(-2.5deg) scaleY(.9); opacity: .18; }
      50% { transform: rotate(2.5deg) scaleY(1); opacity: .38; }
    }
    @keyframes star-pulse {
      0%, 100% { opacity: .2; }
      50% { opacity: .55; }
    }
    @keyframes armory-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    @keyframes blade-glow {
      0%, 100% { filter: drop-shadow(0 0 2px #a8d8ff); }
      50% { filter: drop-shadow(0 0 8px #f4c95d); }
    }
    @media (prefers-reduced-motion: reduce) {
      .bg-svg, .bg-fog, .bg-runes, .bg-wave-1, .bg-wave-2, .bg-wave-3, .bg-laser, .bg-star, .laser-blade, .armory-slot.is-dominant .armory-icon-wrap, .armory-slot.load-pulse, .jump-section.is-highlighted, .chart-star-current, .chart-deco-star { animation: none !important; }
      .armory-slot:hover, .armory-slot.is-armory-selected { transform: none; }
    }

    .page {
      position: relative;
      z-index: 1;
      padding:
        calc(var(--page-pad-y) + var(--safe-top))
        calc(var(--page-pad-x) + var(--safe-right))
        calc(2.75rem + var(--safe-bottom))
        calc(var(--page-pad-x) + var(--safe-left));
    }
    .wrap { max-width: min(100%, var(--page-max)); margin: 0 auto; }

    /* Unified card column · verdict through body */
    .card-column {
      display: flex;
      flex-direction: column;
      border-radius: var(--card-radius);
      overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,.45), 0 0 0 1px rgba(168,216,255,.06);
    }
    .card-column .verdict-band { border-radius: var(--card-radius) var(--card-radius) 0 0; }
    .card-column .body {
      margin-top: 0;
      border-radius: 0;
      box-shadow: none;
    }
    .card-column .section-intel { border-left: none; border-right: none; }

    .smoke-banner {
      margin: 0 0 .75rem;
      padding: .65rem .85rem;
      border-radius: 10px;
      background: linear-gradient(90deg, rgba(232,184,77,.18), rgba(212,90,58,.12));
      border: 1px dashed rgba(232,184,77,.55);
      color: #f5e6c8;
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.45;
    }
    .smoke-banner code {
      font-family: var(--font-mono);
      font-size: .65rem;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0;
      opacity: .9;
    }

    .voyage-banner {
      margin: 0 0 .75rem;
      padding: .55rem .85rem;
      border-radius: 10px;
      background: linear-gradient(90deg, rgba(168,216,255,.12), rgba(26,155,114,.08));
      border: 1px solid rgba(168,216,255,.28);
      color: #c8dce8;
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: .04em;
      text-align: center;
      line-height: 1.45;
    }

    /* claymore · verdict band */
    .verdict-band {
      border-radius: 14px 14px 0 0;
      padding: 1rem 1.25rem;
      border: 1px solid transparent;
      border-bottom: none;
    }
    .verdict-band.likely-ok {
      background: var(--clear-bg);
      border-color: var(--clear-border);
      color: #0d3d2e;
    }
    .verdict-band.fix-list {
      background: var(--review-bg);
      border-color: var(--review-border);
      color: #5c3d08;
    }
    .verdict-band.escalate {
      background: var(--escalate-bg);
      border-color: var(--escalate-border);
      color: #1a3d5c;
    }
    .verdict-band-top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: .5rem;
      margin-bottom: .35rem;
    }
    .verdict-band .brand {
      margin: 0;
      color: inherit;
      opacity: .75;
    }
    .verdict-band h1 {
      font-family: var(--font-display);
      font-size: clamp(1.25rem, 3.5vw, 1.75rem);
      font-weight: 700;
      margin: 0;
      line-height: var(--leading-tight);
      color: inherit;
      max-width: 26ch;
      letter-spacing: 0.01em;
      text-wrap: balance;
    }
    .verdict-band .verdict-pill {
      margin: 0;
      background: rgba(255,255,255,.55);
      border: 1px solid rgba(0,0,0,.08);
    }
    .verdict-band.likely-ok .verdict-pill { color: var(--clear); }
    .verdict-band.fix-list .verdict-pill { color: var(--review); }
    .verdict-band.escalate .verdict-pill { color: var(--escalate); }

    /* claymore · gaelic + phonetic */
    .gaelic-block { margin: .5rem 0 0; }
    .gaelic-phrase {
      margin: 0 0 .25rem;
      font-family: var(--font-display);
      font-size: var(--text-sm);
      line-height: 1.4;
    }
    .gaelic-phrase .gd { font-style: italic; color: inherit; opacity: .95; }
    .gaelic-phrase .phonetic {
      font-family: var(--font-ui);
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: .04em;
      color: inherit;
      opacity: .7;
      margin-left: .25rem;
    }
    .gaelic-phrase .en-meaning {
      display: block;
      font-family: var(--font-ui);
      font-size: var(--text-xs);
      font-style: normal;
      opacity: .65;
      margin-top: .1rem;
    }
    .phonetic-inline {
      font-size: var(--text-xs);
      font-weight: 600;
      opacity: .75;
    }

    /* claymore · armory rating */
    .armory {
      background: rgba(7, 20, 32, .85);
      border: 1px solid rgba(168, 216, 255, .12);
      border-radius: 0;
      border-top: none;
      padding: .85rem 1rem 1rem;
      margin-bottom: .75rem;
      backdrop-filter: blur(8px);
    }
    .armory-kicker {
      margin: 0 0 .65rem;
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: var(--tracking-wider);
      text-transform: uppercase;
      color: var(--smoke);
      text-align: center;
    }
    .armory-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: .5rem;
      align-items: stretch;
    }
    .armory-tier-col {
      display: flex;
      flex-direction: column;
      gap: .4rem;
      min-width: 0;
    }
    .armory-tier-col .quick-bar {
      justify-content: center;
      flex-wrap: wrap;
    }
    .armory-slot {
      text-align: center;
      padding: .65rem .35rem .55rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,.06);
      background: rgba(255,255,255,.03);
      transition: border-color .2s, background .2s, transform .2s, box-shadow .2s;
      font: inherit;
      color: inherit;
      cursor: pointer;
      width: 100%;
      position: relative;
    }
    .quick-btn:focus-visible {
      outline: 2px solid var(--laser);
      outline-offset: 2px;
    }
    .armory-slot:focus-visible {
      outline: 2px solid var(--laser);
      outline-offset: 2px;
    }
    .armory-slot.has-count { background: rgba(255,255,255,.05); }
    .armory-slot.ship { color: var(--clear); }
    .armory-slot.optics { color: var(--review); }
    .armory-slot.claymore { color: var(--escalate); }
    .armory-slot.is-dominant {
      border-color: currentColor;
      background: rgba(255,255,255,.08);
      box-shadow: 0 0 24px rgba(168,216,255,.08);
    }
    .armory-slot.is-armory-selected {
      transform: translateY(-2px);
      box-shadow: 0 0 0 2px currentColor, 0 8px 28px rgba(0,0,0,.25);
    }
    .armory-slot.load-pulse {
      animation: armory-load-pulse 1.2s ease-out 2;
    }
    @keyframes armory-load-pulse {
      0%, 100% { box-shadow: 0 0 0 0 transparent; }
      50% { box-shadow: 0 0 0 3px currentColor, 0 0 20px currentColor; }
    }
    .armory-slot:hover.is-jumpable {
      transform: translateY(-1px);
      background: rgba(255,255,255,.1);
      border-color: rgba(255,255,255,.2);
    }
    .armory-slot.is-dominant.claymore {
      box-shadow: 0 0 28px rgba(168,216,255,.18);
    }
    .armory-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 44px;
      margin-bottom: .25rem;
    }
    .armory-icon { width: 40px; height: auto; display: block; }
    .armory-slot.claymore .armory-icon { width: 28px; }
    .armory-slot.is-dominant .laser-blade { animation: blade-glow 3s ease-in-out infinite; }
    .armory-count {
      display: block;
      font-size: var(--text-2xl);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: var(--leading-tight);
      letter-spacing: -.02em;
    }
    .armory-label {
      display: block;
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      margin-top: .15rem;
    }
    .armory-sub {
      display: block;
      font-size: .625rem;
      color: var(--smoke);
      margin-top: .1rem;
      letter-spacing: .04em;
    }
    .armory-note {
      margin: .65rem 0 0;
      font-size: .625rem;
      text-align: center;
      color: var(--smoke);
      letter-spacing: .03em;
    }
    .armory-jump-hint {
      display: block;
      font-size: .5625rem;
      font-weight: 700;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: var(--smoke);
      margin-top: .35rem;
      opacity: 0;
      transition: opacity .2s;
    }
    .armory-slot:hover .armory-jump-hint,
    .armory-slot.is-armory-selected .armory-jump-hint { opacity: 1; }
    .armory-slot.is-dominant .armory-icon-wrap { animation: armory-float 5s ease-in-out infinite; }

    /* claymore · voyage chart */
    .voyage-chart {
      margin: 0;
      padding: 1rem 1.1rem 1.1rem;
      background: rgba(7, 20, 32, .9);
      border: 1px solid rgba(168, 216, 255, .14);
      border-radius: 0;
      border-top: none;
    }
    .voyage-chart-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: .75rem;
      margin-bottom: .75rem;
    }
    .voyage-chart-title {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 700;
      color: #e8eef4;
      letter-spacing: -.02em;
    }
    .voyage-chart-dek {
      margin: .2rem 0 0;
      font-size: var(--text-xs);
      color: var(--smoke);
      max-width: 28em;
    }
    .voyage-chart-stats {
      display: flex;
      gap: .65rem;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    .voyage-stat {
      font-size: var(--text-xs);
      color: var(--smoke);
      text-align: center;
    }
    .voyage-stat em {
      display: block;
      font-style: normal;
      font-size: var(--text-xl);
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--laser);
      line-height: 1.1;
    }
    .voyage-stat-now em { color: var(--gold); }
    .voyage-svg { width: 100%; height: auto; display: block; border-radius: 10px; }
    .chart-star-current { animation: chart-star-pulse 3s ease-in-out infinite; }
    .chart-deco-star { animation: star-pulse 8s ease-in-out infinite; }
    @keyframes chart-star-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .75; }
    }
    .voyage-legend {
      display: flex;
      flex-wrap: wrap;
      gap: .75rem 1rem;
      margin-top: .65rem;
      font-size: .625rem;
      font-weight: 600;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: var(--smoke);
    }
    .voyage-legend .leg {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: .35rem;
      vertical-align: middle;
    }
    .leg-clear { background: #9adfc4; box-shadow: 0 0 6px #1a9b72; }
    .leg-review { background: #f4c95d; }
    .leg-escalate { background: #8ec8ff; }

    /* claymore · jump targets */
    .jump-section {
      scroll-margin-top: 1.25rem;
      transition: box-shadow .3s ease, border-color .3s ease;
    }
    .jump-section.is-highlighted {
      animation: section-highlight 2s ease-out;
    }
    .jump-section.highlight-ship.is-highlighted {
      box-shadow: inset 0 0 0 3px var(--clear), 0 0 32px rgba(26,155,114,.25);
    }
    .jump-section.highlight-optics.is-highlighted {
      box-shadow: inset 0 0 0 3px var(--review), 0 0 32px rgba(196,127,10,.22);
    }
    .jump-section.highlight-claymore.is-highlighted {
      box-shadow: inset 0 0 0 3px var(--escalate), 0 0 36px rgba(74,143,212,.28);
    }
    details.jump-section.highlight-ship.is-highlighted {
      border-color: var(--clear);
      box-shadow: 0 0 0 2px var(--clear), 0 0 28px rgba(26,155,114,.2);
    }
    @keyframes section-highlight {
      0% { filter: brightness(1); }
      12% { filter: brightness(1.06); }
      100% { filter: brightness(1); }
    }
    .section-label-tier {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: .5rem;
      margin-bottom: .65rem;
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--ink);
    }
    .section-label-dark { color: #e8eef4; }
    .section-label-dark .tier-count { background: rgba(255,255,255,.1); color: var(--mist); }
    .tier-chip {
      font-size: .625rem;
      font-weight: 800;
      letter-spacing: .12em;
      text-transform: uppercase;
      padding: .22rem .55rem;
      border-radius: 100px;
      flex-shrink: 0;
    }
    .chip-clear { background: var(--clear-bg); color: var(--clear); border: 1px solid var(--clear-border); }
    .chip-review { background: var(--review-bg); color: var(--review); border: 1px solid var(--review-border); }
    .chip-escalate { background: var(--escalate-bg); color: var(--escalate); border: 1px solid var(--escalate-border); }
    .chip-housekeeping { background: var(--housekeeping-bg); color: var(--housekeeping); border: 1px solid var(--border); }
    .chip-actions { background: #eef2f7; color: var(--ink-soft); border: 1px solid var(--border); }
    .tier-count {
      margin-left: auto;
      font-variant-numeric: tabular-nums;
      font-size: var(--text-xs);
      font-weight: 800;
      padding: .15rem .5rem;
      border-radius: 6px;
      background: rgba(0,0,0,.05);
    }
    .section-escalate {
      margin: 0;
      padding: 1.35rem 1.4rem;
      background: var(--fjord-mid);
      border-top: 1px solid rgba(168,216,255,.12);
    }
    .section-escalate.is-hot {
      background: linear-gradient(160deg, #1a3048 0%, var(--fjord) 100%);
      box-shadow: inset 0 1px 0 rgba(168,216,255,.15);
    }
    .escalate-quiet {
      display: flex;
      gap: .75rem;
      align-items: center;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(168,216,255,.12);
      border-radius: 10px;
      padding: 1rem;
      color: #c8d4e0;
    }
    .escalate-quiet-icon {
      width: 36px; height: 36px;
      background: rgba(26,155,114,.25);
      color: #9adfc4;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800;
      flex-shrink: 0;
    }
    .escalate-quiet strong { color: #e8eef4; display: block; margin-bottom: .2rem; }
    .escalate-quiet p { margin: 0; font-size: var(--text-sm); }
    .horn-cta-active { margin: .75rem 0 0; border-radius: 12px; overflow: hidden; }
    details.clear-fold summary .tier-chip { margin-right: .35rem; vertical-align: middle; }

    /* claymore · quick sub-buttons */
    .quick-bar {
      display: flex;
      flex-wrap: wrap;
      gap: .35rem;
      margin-top: .5rem;
    }
    .quick-btn {
      font-family: var(--font-ui);
      font-size: .625rem;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      padding: .28rem .5rem;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: #fff;
      color: var(--ink-soft);
      cursor: pointer;
      text-decoration: none;
      line-height: 1.2;
      transition: background .15s, border-color .15s, color .15s, transform .15s;
    }
    .quick-btn:hover {
      border-color: var(--ink-soft);
      color: var(--ink);
      transform: translateY(-1px);
    }
    .quick-btn:active { transform: translateY(0); }
    .armory-tier-col .quick-btn {
      background: rgba(255,255,255,.08);
      border-color: rgba(255,255,255,.15);
      color: var(--mist);
    }
    .armory-tier-col .quick-btn:hover {
      background: rgba(255,255,255,.14);
      color: #fff;
    }
    .armory-tier-col.ship .quick-open:hover { border-color: var(--clear); color: #9adfc4; }
    .armory-tier-col.optics .quick-open:hover { border-color: var(--review); color: #e8b84d; }
    .armory-tier-col.claymore .quick-open:hover { border-color: var(--escalate); color: var(--laser); }
    .evidence-item .quick-bar { padding-left: 0; }
    .housekeeping-list .quick-bar { margin-top: .45rem; }
    .action-card .quick-bar { margin-top: .65rem; padding-top: .5rem; border-top: 1px dashed #e4d9c8; }
    .card-toast {
      position: fixed;
      bottom: 1.25rem;
      left: 50%;
      transform: translateX(-50%) translateY(120%);
      z-index: 100;
      background: var(--fjord);
      color: #e8eef4;
      border: 1px solid rgba(168,216,255,.25);
      border-radius: 10px;
      padding: .65rem 1rem;
      font-size: var(--text-sm);
      font-weight: 600;
      box-shadow: 0 12px 40px rgba(0,0,0,.4);
      opacity: 0;
      transition: transform .25s ease, opacity .25s ease;
      pointer-events: none;
      max-width: min(90vw, 420px);
      text-align: center;
    }
    .card-toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* claymore · hero */
    .hero {
      background: var(--fjord-mid);
      color: #e8eef4;
      border-radius: 0;
      padding: 1.1rem 1.35rem 1.2rem;
      border: 1px solid rgba(168,216,255,.1);
      border-top: none;
      position: relative;
    }
    .hero::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold), var(--laser), transparent);
      opacity: .6;
    }
    .hero-brand {
      margin-bottom: 1rem;
    }
    .brand {
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: var(--tracking-wider);
      text-transform: uppercase;
      color: var(--mist);
      margin: 0 0 .5rem;
    }
    .hero h1 {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: 700;
      margin: 0 0 .35rem;
      color: #fff;
      letter-spacing: -.025em;
      line-height: var(--leading-tight);
    }
    .gaelic-block .gaelic-phrase .gd { color: var(--laser); }
    .gaelic-block .gaelic-phrase .phonetic { color: var(--mist); }
    .gaelic-block .gaelic-phrase .en-meaning { color: var(--smoke); }
    .verdict-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: .65rem;
      margin: 1rem 0 .85rem;
    }
    .verdict-pill {
      display: inline-flex;
      align-items: center;
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      padding: .4rem .85rem;
      border-radius: 100px;
    }
    .verdict-pill.likely-ok { background: rgba(61,170,140,.22); color: #9adfc4; border: 1px solid rgba(61,170,140,.45); }
    .verdict-pill.fix-list { background: rgba(244,201,93,.18); color: var(--gold); border: 1px solid rgba(244,201,93,.4); }
    .verdict-pill.escalate { background: rgba(168,216,255,.12); color: var(--laser); border: 1px solid rgba(168,216,255,.35); box-shadow: 0 0 20px rgba(168,216,255,.15); }
    .hero-summary {
      font-size: var(--text-lg);
      font-weight: 600;
      color: #eef4f8;
      margin: 0;
      max-width: 38em;
      line-height: 1.45;
    }
    .mission-brief { border-bottom: 1px solid rgba(168,216,255,.08); }
    .mission-brief .hero-summary {
      font-size: var(--text-lg);
      line-height: var(--leading-relaxed);
      letter-spacing: 0.01em;
    }
    .mission-brief .hero-meta {
      letter-spacing: 0.03em;
      font-size: var(--text-xs);
      text-transform: uppercase;
      opacity: 0.85;
    }
    .mission-leader {
      margin: .65rem 0 0;
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--laser);
      max-width: 36em;
      line-height: 1.5;
    }
    .hero-meta {
      margin-top: 1rem;
      padding-top: .85rem;
      border-top: 1px solid rgba(255,255,255,.08);
      font-size: var(--text-xs);
      font-weight: 500;
      letter-spacing: .03em;
      color: var(--smoke);
    }

    /* claymore · body */
    .body {
      background: var(--paper);
      border-radius: var(--card-radius);
      margin-top: 0;
      border-top: 4px solid var(--gold);
      box-shadow: 0 24px 64px rgba(0,0,0,.45), 0 0 0 1px rgba(168,216,255,.06);
      overflow: hidden;
    }
    .section-actions:not(.section-actions-optional) {
      background: var(--review-bg);
      border-bottom: 2px solid var(--review-border);
    }
    .section-lead {
      font-size: var(--text-base);
      color: var(--ink-soft);
      line-height: 1.55;
      max-width: 36em;
      margin: 0 0 1rem;
    }
    .section { padding: var(--section-pad-y) var(--section-pad-x); border-bottom: 1px solid var(--border); }
    .section:last-of-type { border-bottom: none; }
    .section-label {
      display: flex;
      align-items: center;
      gap: .5rem;
      font-size: var(--text-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--smoke);
      margin-bottom: .65rem;
    }
    .section-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .section-dot.ok, .section-dot.dot-housekeeping { background: var(--clear); }
    .section-dot.warn { background: var(--review); }
    .section-dot.gold { background: var(--review); }
    .section-housekeeping { background: var(--housekeeping-bg); }
    .housekeeping-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: .55rem;
    }
    .housekeeping-list li {
      background: #fff;
      border: 1px solid var(--border);
      border-left: 3px solid var(--housekeeping);
      border-radius: 8px;
      padding: .65rem .75rem;
      font-size: var(--text-sm);
    }
    .housekeeping-list code {
      display: block;
      font-family: var(--font-mono);
      font-size: .7rem;
      word-break: break-all;
      color: var(--ink);
      margin-bottom: .3rem;
    }
    .housekeeping-list span { color: var(--ink-soft); font-size: var(--text-xs); line-height: 1.45; }

    /* Field glass / threat intel */
    .chip-intel { background: var(--intel-bg); color: var(--intel); border: 1px solid var(--intel-border); }
    .section-intel { background: var(--intel-bg); border: 1px solid var(--intel-border); }
    .intel-dek { margin: 0 0 .5rem; color: var(--ink-soft); font-size: var(--text-sm); line-height: 1.5; }
    .intel-asof { margin: 0 0 1rem; font-size: var(--text-xs); color: var(--smoke); }
    .intel-blog-link { color: var(--intel); font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--intel-border); }
    .intel-blog-link:hover { color: var(--fjord); border-color: var(--fjord); }
    .intel-grid { display: flex; flex-direction: column; gap: .85rem; margin-bottom: 1rem; }
    .intel-item, .intel-evergreen {
      background: #fff;
      border: 1px solid var(--border);
      border-left: 3px solid var(--intel);
      border-radius: 8px;
      padding: .75rem .85rem;
    }
    .intel-evergreen { border-left-color: var(--review); background: var(--review-bg); }
    .intel-item-title { margin: 0 0 .35rem; font-size: var(--text-sm); font-weight: 700; color: var(--ink); }
    .intel-body { margin: 0 0 .45rem; font-size: var(--text-xs); line-height: 1.55; color: var(--ink-soft); }
    .intel-innsegall { margin: 0 0 .35rem; font-size: var(--text-xs); line-height: 1.5; color: var(--ink); }
    .intel-source { margin: 0; font-size: var(--text-xs); }
    .intel-source a { color: var(--intel); text-decoration: none; }
    .intel-source a:hover { text-decoration: underline; }

    /* Actions */
    .section-actions { background: var(--review-bg); }
    .section-actions-optional { background: var(--clear-bg); }
    .section-actions-optional .action-card { border-left-color: var(--clear); }
    .section-lead {
      margin: 0 0 1rem;
      font-size: var(--text-sm);
      color: var(--ink-soft);
      line-height: var(--leading-normal);
    }
    .section-lead.muted { margin-bottom: 0; }

    .action-stack { display: flex; flex-direction: column; gap: .75rem; }
    .action-card {
      background: #fff;
      border: 1px solid #e4d9c8;
      border-left: 4px solid var(--gold);
      border-radius: 10px;
      padding: 1rem 1rem .9rem;
      box-shadow: 0 2px 10px rgba(11,29,46,.05);
    }
    .action-head { display: flex; gap: .75rem; align-items: flex-start; margin-bottom: .6rem; }
    .action-step {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      background: var(--fjord);
      color: var(--gold);
      font-weight: 700;
      font-size: 1rem;
      font-variant-numeric: tabular-nums;
      border: 2px solid var(--gold);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(11,29,46,.12);
    }
    .action-card-priority {
      border-left-width: 5px;
      box-shadow: 0 4px 16px rgba(196,127,10,.1);
    }
    .action-head h3 {
      margin: 0 0 .3rem;
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--ink);
      line-height: var(--leading-tight);
    }
    .action-tags { display: flex; flex-wrap: wrap; gap: .35rem; }
    .tag {
      font-size: .625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      padding: .18rem .5rem;
      border-radius: 4px;
    }
    .tag-risk.tag-low { background: #e8f5f0; color: #1a5c48; }
    .tag-risk.tag-medium { background: #fde8d8; color: #8b4518; }
    .tag-risk.tag-high { background: #f5d4cc; color: #7a2e1a; }
    .tag-sudo { background: #e8eef5; color: #1a4a6e; }
    .action-steps {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: .5rem;
      font-size: var(--text-sm);
      color: var(--ink);
      line-height: 1.55;
    }
    .action-steps li {
      display: grid;
      grid-template-columns: 1.5rem 1fr;
      gap: 0 .6rem;
      align-items: start;
      padding: .55rem .65rem;
      background: var(--paper-2);
      border-radius: 8px;
      border: 1px solid #ebe3d4;
      margin: 0;
      counter-increment: action-sub;
    }
    .action-steps { counter-reset: action-sub; }
    .action-steps li::before {
      content: counter(action-sub);
      font-weight: 800;
      font-size: var(--text-xs);
      color: var(--gold);
      text-align: center;
      line-height: 1.6rem;
    }

    /* Results */
    .result-stack { display: flex; flex-direction: column; gap: .6rem; }
    .result-card {
      background: #fff;
      border-radius: 10px;
      border: 1px solid #e0d9ce;
      overflow: hidden;
    }
    .result-card.bad { border-left: 5px solid var(--ember); box-shadow: 0 2px 12px rgba(212,90,58,.08); }
    .result-card.warn { border-left: 4px solid var(--gold); }
    .result-head {
      display: flex;
      align-items: flex-start;
      gap: .65rem;
      padding: .9rem 1rem;
    }
    .result-icon {
      flex-shrink: 0;
      width: 28px; height: 28px;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800;
      font-size: var(--text-sm);
    }
    .result-card.warn .result-icon { background: #fde8d8; color: #8b4518; }
    .result-card.bad .result-icon { background: #f5d4cc; color: #7a2e1a; }
    .result-titles { flex: 1; min-width: 0; }
    .result-titles h3 {
      margin: 0 0 .25rem;
      font-size: var(--text-base);
      font-weight: 800;
      line-height: var(--leading-tight);
      color: var(--ink);
    }
    .result-titles p { margin: 0; font-size: var(--text-xs); color: var(--smoke); line-height: 1.5; }
    .evidence-fold {
      border-top: 1px solid #e0d9ce;
      padding: 0 1rem .75rem;
    }
    .evidence-fold summary {
      cursor: pointer;
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      color: var(--smoke);
      padding: .5rem 0;
    }
    .intel-fold {
      margin-bottom: .75rem;
      border: 1px solid rgba(168,216,255,.12);
      border-radius: 0 0 8px 8px;
      background: rgba(7, 20, 32, .6);
    }
    .intel-fold-summary {
      cursor: pointer;
      padding: .65rem 1rem;
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--mist);
      list-style: none;
    }
    .intel-fold[open] .intel-fold-summary { border-bottom: 1px solid rgba(168,216,255,.1); }
    .result-badge {
      font-size: .625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      padding: .22rem .5rem;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .result-card.warn .result-badge { background: #fde8d8; color: #8b4518; }
    .result-card.bad .result-badge { background: #f5d4cc; color: #7a2e1a; }
    .evidence {
      margin: 0;
      padding: .55rem 1rem .8rem 1rem;
      list-style: none;
      background: var(--paper-2);
      border-top: 1px solid #e0d9ce;
      font-size: var(--text-xs);
      color: var(--ink-soft);
    }
    .evidence li { margin-bottom: .35rem; padding-left: .5rem; border-left: 2px solid #d4cbb8; }
    .evidence code {
      font-family: var(--font-mono);
      background: #fff;
      padding: .15rem .4rem;
      border-radius: 4px;
      word-break: break-all;
      font-size: .7rem;
      border: 1px solid #e0d8cc;
    }
    .all-clear-banner {
      display: flex;
      gap: .75rem;
      align-items: center;
      background: #e8f5f0;
      border: 1px solid #b8e0d0;
      border-radius: 10px;
      padding: 1rem;
    }
    .all-clear-icon {
      width: 38px; height: 38px;
      background: var(--aurora);
      color: #fff;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800;
      flex-shrink: 0;
    }
    .all-clear-banner strong { font-size: var(--text-base); }
    .all-clear-banner p { margin: .2rem 0 0; font-size: var(--text-sm); color: var(--ink-soft); }

    /* Horn CTA */
    .horn-cta { margin: 0; border-radius: 0; overflow: hidden; }
    .horn-inner {
      background: linear-gradient(135deg, var(--fjord) 0%, var(--fjord-mid) 100%);
      color: #e8eef4;
      padding: 1.2rem 1.25rem;
      text-align: center;
      border: 1px solid rgba(168,216,255,.15);
    }
    .horn-inner h3 {
      margin: 0 0 .35rem;
      font-family: var(--font-display);
      color: var(--gold);
      font-size: var(--text-xl);
      font-weight: 700;
    }
    .horn-inner p { margin: 0 0 .85rem; font-size: var(--text-sm); color: #c8d4e0; }
    .horn-actions { display: flex; gap: .5rem; justify-content: center; flex-wrap: wrap; }
    .horn-btn {
      font-family: var(--font-ui);
      font-size: var(--text-sm);
      font-weight: 700;
      padding: .55rem 1.1rem;
      border-radius: 8px;
      border: none;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .horn-secondary { background: transparent; color: var(--laser); border: 1px solid rgba(168,216,255,.4); }
    .section-parley.is-parley-live { box-shadow: 0 0 0 2px rgba(244,201,93,.35); }
    .parley-status {
      margin: 0 0 .65rem;
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
      color: var(--intel);
    }
    .parley-ask-row {
      display: flex;
      gap: .5rem;
      margin-top: .85rem;
      flex-wrap: wrap;
    }
    .parley-ask-input {
      flex: 1 1 12rem;
      min-height: var(--touch-min);
      padding: .5rem .75rem;
      border-radius: 8px;
      border: 1px solid var(--border);
      font-family: var(--font-ui);
      font-size: var(--text-sm);
    }
    .parley-ask-btn {
      font-family: var(--font-ui);
      font-weight: 700;
      padding: .5rem 1rem;
      border-radius: 8px;
      border: none;
      background: var(--intel);
      color: #fff;
      cursor: pointer;
      min-height: var(--touch-min);
    }
    .horn-primary { background: var(--gold); color: var(--fjord); }
    .section-parley {
      background: linear-gradient(180deg, var(--paper-2) 0%, #fff 45%);
      border-top: 3px solid var(--intel);
    }
    .parley-status {
      display: inline-flex;
      align-items: center;
      gap: .35rem;
      padding: .25rem .6rem;
      border-radius: 100px;
      background: var(--intel-bg);
      border: 1px solid var(--intel-border);
      font-size: var(--text-xs);
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: .75rem;
    }
    .section-parley.is-parley-live .parley-status {
      background: var(--review-bg);
      border-color: var(--review-border);
      color: var(--review);
    }
    .parley-static-body {
      background: #fff;
      border: 1px solid var(--border);
      border-left: 4px solid var(--intel);
      border-radius: 8px;
      padding: 1rem 1.1rem;
      font-size: var(--text-sm);
      color: var(--ink-soft);
      line-height: 1.6;
    }
    .parley-static-body p { margin: 0 0 .75rem; }
    .parley-static-body p:first-child {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--ink);
    }
    .parley-cap-note { margin: .65rem 0 0; font-size: var(--text-xs); color: var(--smoke); }
    .share-dock {
      margin: 1.5rem auto 1.25rem;
      padding: 1.15rem 1.25rem;
      max-width: 28rem;
      text-align: center;
      border-radius: 12px;
      border: 1px solid rgba(244, 201, 93, 0.28);
      background: linear-gradient(180deg, rgba(244, 201, 93, 0.1), rgba(7, 20, 32, 0.55));
      box-shadow: 0 0 0 1px rgba(168, 216, 255, 0.06) inset;
    }
    .share-dock-label {
      margin: 0 0 0.35rem;
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--gold);
      letter-spacing: 0.02em;
    }
    .share-btn {
      font-family: var(--font-ui);
      font-size: var(--text-sm);
      font-weight: 700;
      letter-spacing: 0.04em;
      padding: 0.65rem 1.15rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(180deg, #f8d574 0%, var(--gold) 50%, #c9962e 100%);
      color: #0f1a24;
      cursor: pointer;
      margin-top: 0.75rem;
      min-height: var(--touch-min);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.15) inset,
        0 3px 0 #8f6420,
        0 10px 28px rgba(232, 184, 77, 0.28);
      transition: transform 0.12s ease, filter 0.12s ease;
    }
    .share-btn:hover {
      filter: brightness(1.04);
      transform: translateY(-1px);
      color: #0f1a24;
    }
    .share-hint {
      display: block;
      font-family: var(--font-ui);
      font-size: var(--text-sm);
      color: var(--mist);
      margin: 0;
      line-height: var(--leading-relaxed);
      max-width: 32rem;
      margin-left: auto;
      margin-right: auto;
    }
    .scout-paste-store {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: pre;
      border: 0;
    }
    .footer-pricing {
      display: block;
      font-family: var(--font-ui);
      font-style: normal;
      font-size: var(--text-xs);
      color: var(--smoke);
      margin-top: .35rem;
      letter-spacing: .02em;
    }
    .horn-note { margin: .75rem 0 0 !important; font-size: var(--text-xs) !important; color: var(--smoke) !important; }
    .horn-cta-soft {
      background: var(--paper-2);
      border: 1px dashed #d4cbb8;
      padding: .9rem 1.1rem;
      font-size: var(--text-sm);
      color: var(--ink-soft);
      text-align: center;
    }
    .horn-cta-soft p { margin: 0; }

    /* Context */
    .context-list { margin: 0; padding-left: 1.15rem; font-size: var(--text-sm); color: var(--ink-soft); }
    .project-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
    .project-stat {
      background: #fff;
      border: 1px solid #e0d9ce;
      border-radius: 8px;
      padding: .65rem .5rem;
      text-align: center;
    }
    .project-k {
      display: block;
      font-size: .625rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: var(--smoke);
    }
    .project-v {
      display: block;
      font-size: var(--text-sm);
      font-weight: 700;
      margin-top: .2rem;
      word-break: break-all;
    }
    .project-note { margin: .65rem 0 0; font-size: var(--text-sm); color: var(--aurora); font-weight: 600; }

    /* Clear list */
    details.clear-fold {
      margin-top: 1rem;
      background: rgba(7, 20, 32, .55);
      border: 1px solid rgba(168,216,255,.1);
      border-radius: 12px;
      overflow: hidden;
      backdrop-filter: blur(6px);
    }
    details.clear-fold summary {
      padding: .9rem 1rem;
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--mist);
      cursor: pointer;
      list-style: none;
      display: flex;
      align-items: center;
      gap: .5rem;
    }
    details.clear-fold summary::before { content: "▸"; color: var(--aurora); font-size: .75rem; }
    details.clear-fold[open] summary::before { content: "▾"; }
    .clear-list { margin: 0; padding: 0 1rem 1rem; list-style: none; }
    .clear-list li {
      display: flex;
      flex-direction: column;
      gap: .12rem;
      padding: .55rem 0;
      border-bottom: 1px solid rgba(255,255,255,.06);
      font-size: var(--text-sm);
    }
    .clear-list li:last-child { border-bottom: none; }
    .clear-name { font-weight: 700; color: #e8eef4; }
    .clear-detail { color: var(--smoke); font-size: var(--text-xs); }

    /* Footer */
    .footer {
      max-width: min(100%, var(--page-max));
      margin: 1.35rem auto 0;
      padding: 0 var(--page-pad-x);
      text-align: center;
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-style: italic;
      color: var(--mist);
      line-height: 1.65;
    }
    .footer strong { color: var(--gold); font-weight: 700; font-style: normal; }
    .footer-id {
      display: block;
      font-family: var(--font-ui);
      font-style: normal;
      font-size: var(--text-xs);
      color: var(--smoke);
      margin-top: .4rem;
      letter-spacing: .02em;
    }

    @media print {
      .battlefield { display: none; }
      body { background: #fff; color: #111; }
      .page { padding: 0; }
      .card-column { box-shadow: none; border: 1px solid #ccc; }
      .armory { background: #f5f5f5; border-color: #ccc; }
      .armory-kicker, .armory-sub { color: #666; }
      .hero { background: #1a2332; }
      .body { box-shadow: none; margin-top: 0; }
      details.clear-fold { background: #f9f9f9; border-color: #ddd; }
      .clear-name { color: #111; }
      .horn-note { display: none; }
      .share-dock {
        border-color: #ccc;
        background: #faf8f3;
        break-inside: avoid;
      }
      .share-btn { display: none; }
      .share-hint { color: #444; font-size: 10pt; }
      .footer { color: #333; }
      .footer strong { color: #111; }
    }

    /* Large Mac · 13–16" comfortable read width */
    @media (min-width: 1024px) {
      :root {
        --page-max: 50rem;
        --text-base: 1rem;
        --text-lg: 1.1875rem;
        --text-xl: 1.5rem;
        --text-2xl: 2rem;
        --section-pad-x: 1.65rem;
        --section-pad-y: 1.5rem;
      }
      .verdict-band h1 { font-size: var(--text-2xl); }
      .verdict-band { padding: 1.15rem 1.5rem; }
      .hero-summary { font-size: var(--text-xl); }
      .armory { padding: 1rem 1.25rem 1.1rem; }
      .voyage-chart { padding: 1.1rem 1.35rem 1.2rem; }
      .intel-item-title { font-size: var(--text-base); }
      .intel-body, .intel-innsegall { font-size: var(--text-sm); }
      .action-head h3 { font-size: var(--text-lg); }
      .result-titles h3 { font-size: var(--text-base); }
    }

    /* Tablet · iPad / narrow Mac window */
    @media (min-width: 768px) and (max-width: 1023px) {
      :root {
        --page-max: 44rem;
      }
      .armory-row { gap: .65rem; }
      .project-grid { grid-template-columns: repeat(3, 1fr); }
    }

    /* Mobile · stack and touch */
    @media (max-width: 767px) {
      :root {
        --section-pad-x: 1.1rem;
        --section-pad-y: 1.15rem;
      }
      .verdict-band h1 { font-size: var(--text-lg); }
      .hero-summary { font-size: var(--text-base); }
      .voyage-chart-head { flex-direction: column; align-items: flex-start; }
      .voyage-chart-stats { width: 100%; justify-content: space-between; }
      .project-grid { grid-template-columns: 1fr 1fr; }
      .project-grid .project-stat:last-child { grid-column: 1 / -1; }
      .horn-actions { flex-direction: column; align-items: stretch; }
      .horn-btn { min-height: var(--touch-min); display: flex; align-items: center; justify-content: center; }
      .quick-btn {
        min-height: 36px;
        padding: .4rem .65rem;
        font-size: var(--text-xs);
      }
      .armory-tier-col .quick-btn { min-height: var(--touch-min); }
      .tier-count { margin-left: 0; }
      .section-label-tier { flex-direction: column; align-items: flex-start; }
      .intel-asof { line-height: 1.5; }
    }

    @media (max-width: 520px) {
      .armory-row, .project-grid { grid-template-columns: 1fr; }
      .project-grid .project-stat:last-child { grid-column: auto; }
      .armory-tier-col { gap: .35rem; }
      .armory-slot {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        gap: 0 .65rem;
        text-align: left;
        padding: .75rem;
        min-height: var(--touch-min);
      }
      .armory-icon-wrap { grid-row: 1 / 3; height: auto; margin: 0; }
      .armory-count { font-size: var(--text-xl); }
      .action-head { flex-wrap: wrap; }
      .result-head { flex-wrap: wrap; }
      .result-badge { margin-left: 2.5rem; }
      .card-toast {
        left: var(--page-pad-x);
        right: var(--page-pad-x);
        transform: translateY(120%);
        max-width: none;
      }
      .card-toast.show { transform: translateY(0); }
    }
  </style>
</head>
<body>
  ${BATTLEFIELD_BG}
  <div class="page">
    <div class="wrap">
      ${smokeBanner}
      ${voyageBanner}
      <div class="card-column">
      <div class="verdict-band ${verdictClass}">
        <div class="verdict-band-top">
          <p class="brand">Innsegall${CLAYMORE}${ARTIFACT_NAME}</p>
          <span class="verdict-pill ${verdictClass}">${esc(verdictHuman)}</span>
        </div>
        <h1>${esc(vc.headline || card.verdict)}</h1>
        ${gaelicHtml}
      </div>

      <header class="hero mission-brief">
        <p class="hero-summary">${richText(card.summary)}</p>
        ${leaderLine ? `<p class="mission-leader">${richText(leaderLine)}</p>` : ""}
        <p class="hero-meta">${esc(date)} · ${esc(flowLabel)} · macOS ${esc(card.platform_version)} · ${esc(statsLine(card))}</p>
      </header>

      ${renderArmoryRating(stats, card.verdict)}

      ${chartHtml}

      ${intelHtml}

      <main class="body">
        ${userReport}
        ${actionsHtml}
        ${attentionHtml}
        ${escalateHtml}
        ${parleyHtml}
        ${hornHtml}
        ${housekeepingHtml}
        ${project}
      </main>
      </div>

      <details id="section-clear" class="clear-fold jump-section jump-tier-ship">
        <summary><span class="tier-chip chip-clear">Clear</span> ${clear.length} checks passed · full check log</summary>
        <ul class="clear-list">${clearList}</ul>
      </details>

      <footer class="footer">
        <div class="share-dock">
          <p class="share-dock-label">Share this Battle Scout</p>
          <p class="share-hint">Copy a clean audit log for family, IT, or any AI assistant · you control every paste.</p>
          <button type="button" class="share-btn" id="battle-scout-share">${esc(CTA.COPY_FOR_AI)}</button>
        </div>
        <textarea id="innsegall-scout-paste" class="scout-paste-store" readonly aria-hidden="true">${embedTextareaContent(renderAiPaste(card))}</textarea>
        <strong>With Innsegall, no one is your enemy · you have no foe.</strong>
        <span class="footer-id">innsegall.com · ${esc(card.card_id)} · engine ${esc(card.engine_version)}</span>
        ${pricingFooter}
      </footer>
    </div>
  </div>
  ${cardJumpScript(CTA.COPY_FOR_AI_TOAST)}
  ${renderParleyEmbedScript(card)}
  ${PARLEY_LIVE_SCRIPT}
  <div id="card-toast" class="card-toast" role="status" aria-live="polite"></div>
</body>
</html>`;
}
