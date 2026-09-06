import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CARDS_DIR = join(homedir(), "Library/Application Support/Innsegall/cards");

/** 0–100 health for chart altitude (north = calmer seas). */
export function healthScore(card) {
  const s = card.stats || {};
  const pass = s.pass ?? 0;
  const warn = s.warn ?? 0;
  const fail = s.fail ?? 0;
  const total = pass + warn + fail || 1;
  if (card.verdict === "ESCALATE" || fail > 0) {
    return Math.max(5, 22 - fail * 6);
  }
  if (card.verdict === "FIX_LIST" || warn > 0) {
    return 38 + Math.round((pass / total) * 40);
  }
  return 74 + Math.round((pass / total) * 26);
}

function starColor(verdict, score) {
  if (verdict === "ESCALATE" || score < 30) return { fill: "#8ec8ff", glow: "#4a8fd4", label: "Horn" };
  if (verdict === "FIX_LIST" || score < 65) return { fill: "#f4c95d", glow: "#c47f0a", label: "Review" };
  return { fill: "#9adfc4", glow: "#1a9b72", label: "Clear" };
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatChartDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatChartTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** Load chronological voyage points from saved cards. */
export function loadHistorySeries(limit = 48) {
  if (!existsSync(CARDS_DIR)) return [];
  const cards = readdirSync(CARDS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(CARDS_DIR, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const slice = cards.slice(-limit);
  return slice.map((c) => ({
    id: c.card_id,
    at: c.created_at,
    verdict: c.verdict,
    flow: c.flow,
    stats: c.stats || {},
    score: healthScore(c),
  }));
}

function plotPoints(series, width, height, pad) {
  const n = series.length;
  if (n === 0) return [];
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  return series.map((p, i) => {
    const x = pad.l + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = pad.t + innerH - (p.score / 100) * innerH;
    return { ...p, x, y, i };
  });
}

/** SVG sea chart · stars = voyages, north = healthier. */
export function renderHealthChartSvg(series) {
  if (!series.length) {
    return `<svg class="voyage-svg voyage-svg-empty" viewBox="0 0 720 220" aria-label="No voyages yet">
      <text x="360" y="110" text-anchor="middle" fill="#6b7c8f" font-size="14">Run Innsegall again · your star map grows with each voyage.</text>
    </svg>`;
  }

  const W = 720;
  const H = 260;
  const pad = { l: 48, r: 24, t: 28, b: 44 };
  const pts = plotPoints(series, W, H, pad);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const stars = pts
    .map((p) => {
      const c = starColor(p.verdict, p.score);
      const r = p.i === pts.length - 1 ? 6.5 : 4.5;
      const pulse = p.i === pts.length - 1 ? ' class="chart-star chart-star-current"' : ' class="chart-star"';
      return `<g${pulse}>
        <circle cx="${p.x}" cy="${p.y}" r="${r + 6}" fill="${c.glow}" opacity=".2"/>
        <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${c.fill}" stroke="#e8eef4" stroke-width="1"/>
        <title>${esc(formatChartTime(p.at))} · ${esc(p.verdict)} · health ${p.score}</title>
      </g>`;
    })
    .join("");

  const xLabels = pts.length <= 8
    ? pts.map((p) => `<text x="${p.x}" y="${H - 12}" text-anchor="middle" fill="#6b7c8f" font-size="9">${esc(formatChartDate(p.at))}</text>`).join("")
    : `<text x="${pad.l}" y="${H - 12}" fill="#6b7c8f" font-size="9">${esc(formatChartDate(pts[0].at))}</text>
       <text x="${W - pad.r}" y="${H - 12}" text-anchor="end" fill="#6b7c8f" font-size="9">${esc(formatChartDate(pts[pts.length - 1].at))}</text>`;

  const yLabels = [100, 75, 50, 25].map((v) => {
    const y = pad.t + (H - pad.t - pad.b) * (1 - v / 100);
    return `<text x="${pad.l - 8}" y="${y + 3}" text-anchor="end" fill="#5c6b7a" font-size="8">${v}</text>
      <line x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}" stroke="#a8d8ff" stroke-width=".5" stroke-dasharray="4 6" opacity=".25"/>`;
  }).join("");

  const compass = `<g class="chart-compass" transform="translate(${W - 52},${H - 52})">
    <circle r="22" fill="none" stroke="#a8d8ff" stroke-width=".8" opacity=".4"/>
    <text y="-4" text-anchor="middle" fill="#f4c95d" font-size="8" font-weight="bold">N</text>
    <text y="14" text-anchor="middle" fill="#6b7c8f" font-size="7">calm</text>
    <line x1="0" y1="-14" x2="0" y2="14" stroke="#a8d8ff" stroke-width=".6" opacity=".5"/>
    <line x1="-14" y1="0" x2="14" y2="0" stroke="#a8d8ff" stroke-width=".6" opacity=".5"/>
  </g>`;

  const decorStars = [
    [60, 24, 0.8], [180, 18, 0.5], [520, 22, 0.6], [640, 40, 0.4], [400, 12, 0.35],
  ]
    .map(([x, y, o]) => `<circle cx="${x}" cy="${y}" r="1" fill="#a8d8ff" opacity="${o}" class="chart-deco-star"/>`)
    .join("");

  const trend =
    pts.length >= 2
      ? pts[pts.length - 1].score - pts[0].score
      : 0;
  const trendLabel =
    trend > 5 ? "Course improving" : trend < -5 ? "Rougher seas lately" : "Steady voyage";

  return `<svg class="voyage-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Health voyage chart, ${series.length} checks">
    <defs>
      <linearGradient id="chart-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f2840"/>
        <stop offset="100%" stop-color="#060e18"/>
      </linearGradient>
      <filter id="chart-glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="${W}" height="${H}" rx="12" fill="url(#chart-sea)"/>
    ${decorStars}
    ${yLabels}
    <text x="${pad.l}" y="16" fill="#b8c5d4" font-size="9" letter-spacing=".12em">ALTITUDE · VOYAGE HEALTH</text>
    <text x="${W - pad.r}" y="16" text-anchor="end" fill="#f4c95d" font-size="9">${esc(trendLabel)}</text>
    <path d="${pathD}" fill="none" stroke="#a8d8ff" stroke-width="1.2" stroke-dasharray="6 4" opacity=".45" stroke-linecap="round"/>
    <g filter="url(#chart-glow)">${stars}</g>
    ${xLabels}
    ${compass}
  </svg>`;
}

export function renderHealthChartSection(series) {
  const n = series.length;
  const latest = n ? series[n - 1] : null;
  const avg = n ? Math.round(series.reduce((a, p) => a + p.score, 0) / n) : 0;
  return `<section id="section-chart" class="voyage-chart jump-section jump-tier-ship" aria-labelledby="voyage-chart-title">
    <div class="voyage-chart-head">
      <div>
        <h2 id="voyage-chart-title" class="voyage-chart-title">Voyage chart</h2>
        <p class="voyage-chart-dek">Innse Gall sea map · each star is a check. North is calmer water.</p>
      </div>
      <div class="voyage-chart-stats">
        <span class="voyage-stat"><em>${n}</em> voyages</span>
        <span class="voyage-stat"><em>${avg}</em> mean health</span>
        ${latest ? `<span class="voyage-stat voyage-stat-now"><em>${latest.score}</em> now</span>` : ""}
      </div>
    </div>
    ${renderHealthChartSvg(series)}
    <div class="voyage-legend">
      <span><i class="leg leg-clear"></i> Clear longship</span>
      <span><i class="leg leg-review"></i> Review glass</span>
      <span><i class="leg leg-escalate"></i> Horn claymore</span>
    </div>
  </section>`;
}

export const CHART_PAGE_STYLES = `
    body { margin: 0; background: #060e18; color: #e8eef4; font-family: -apple-system, system-ui, sans-serif; padding: clamp(1rem, 2.8vw, 1.75rem); }
    .wrap { max-width: min(100%, 50rem); margin: 0 auto; }
    h1 { font-family: Georgia, serif; font-weight: 600; margin: 0 0 .25rem; }
    .sub { color: #6b7c8f; font-size: .9rem; margin: 0 0 1.25rem; }
    .voyage-chart { margin: 0; padding: 1rem; background: #0a1828; border: 1px solid rgba(168,216,255,.14); border-radius: 12px; }
    .voyage-chart-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .75rem; margin-bottom: .75rem; }
    .voyage-chart-title { margin: 0; font-family: Georgia, serif; font-size: 1.125rem; color: #e8eef4; }
    .voyage-chart-dek { margin: .2rem 0 0; font-size: .75rem; color: #6b7c8f; }
    .voyage-chart-stats { display: flex; gap: .65rem; }
    .voyage-stat { font-size: .75rem; color: #6b7c8f; text-align: center; }
    .voyage-stat em { display: block; font-style: normal; font-size: 1.25rem; font-weight: 800; color: #8ec8ff; }
    .voyage-stat-now em { color: #f4c95d; }
    .voyage-svg { width: 100%; height: auto; display: block; border-radius: 10px; }
    .chart-star-current { animation: pulse 3s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.75} }
    .voyage-legend { display: flex; flex-wrap: wrap; gap: .65rem 1rem; margin-top: .65rem; font-size: .625rem; text-transform: uppercase; color: #6b7c8f; }
    .leg { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: .35rem; }
    .leg-clear { background: #9adfc4; } .leg-review { background: #f4c95d; } .leg-escalate { background: #8ec8ff; }
    @media (max-width: 767px) {
      .voyage-chart-head { flex-direction: column; align-items: flex-start; }
      .voyage-chart-stats { width: 100%; justify-content: space-between; }
    }
`;

/** Standalone chart page (innsegall chart). */
export function renderChartPage(series) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Innsegall · Voyage chart</title>
  <style>${CHART_PAGE_STYLES}</style>
</head>
<body>
  <div class="wrap">
    <h1>Voyage chart</h1>
    <p class="sub">Historical Voyage health · ${series.length} saved checks</p>
    ${renderHealthChartSection(series)}
  </div>
</body>
</html>`;
}
