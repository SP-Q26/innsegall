#!/usr/bin/env node
/**
 * Full Innsegall OAR pass · layers 0–4 + site sweep report.
 */
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const today = new Date().toISOString().slice(0, 10);
const surfaces = JSON.parse(
  readFileSync(join(root, "fixtures", "innsegall-oar-surfaces.json"), "utf8")
);

const layers = [
  { name: "0 · Canon + gospel weld", cmd: "node scripts/audit-gtm-scope.mjs" },
  { name: "1–2 · Adoption voice + surfaces", cmd: "node scripts/audit-adoption-voice.mjs" },
  { name: "2 · Landing unity", cmd: "node scripts/audit-landing-unity.mjs" },
  { name: "3 · EN corpus gate", cmd: "npm run audit:en-coverage" },
  { name: "3 · i18n readiness", cmd: "npm run audit:i18n-readiness" },
  { name: "3b · i18n es/pt ship", cmd: "npm run audit:i18n" },
  { name: "4 · Brand stack", cmd: "npm run audit:copy" },
  { name: "4 · Client-facing", cmd: "npm run audit:client-facing" },
  { name: "4 · Funnel conversion", cmd: "npm run audit:funnel-conversion" },
];

let failed = 0;
console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  Innsegall OAR pass (Operator Adoption Rubric)                 ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

for (const layer of layers) {
  console.log(`── ${layer.name} ──`);
  try {
    execSync(layer.cmd, { cwd: root, stdio: "inherit", env: process.env });
  } catch {
    failed++;
    console.error(`OAR FAIL · ${layer.name}\n`);
  }
}

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

const rows = [];
for (const abs of walkHtml(web)) {
  const rel = relative(web, abs).replace(/\\/g, "/");
  const html = readFileSync(abs, "utf8");
  const hasGospel = html.includes("innsegall-gospel") || html.includes("innsegall-ai-bus");
  const hasCta =
    /Send the scout|Bring your clan|Enviar el explorador|Enviar o scout|Enviamos el explorador|Enviamos o scout/i.test(
      html
    );
  const hasLane = /not antivirus|post-scare|Battle Scout/i.test(html);
  const hasOg = html.includes("og:innsegall-card.png") || rel.includes("samples/");
  const hasLocale = html.includes("data-locale-picker") || !html.includes("site-header");
  rows.push({
    rel,
    gospel: hasGospel ? "y" : "n",
    cta: hasCta ? "y" : "n",
    lane: hasLane ? "y" : "n",
    og: hasOg ? "y" : "n",
    locale: hasLocale ? "y" : "n",
  });
}

const issues = rows.filter((r) => {
  if (r.rel === "success.html" || r.rel.startsWith("samples/")) return false;
  return r.gospel === "n" || (r.cta === "n" && !r.rel.startsWith("api"));
});

const md = `# Innsegall OAR site sweep · ${today}

**Lens:** Operator Adoption Rubric · \`docs/INNSEGALL_OPERATOR_VOICE.md\`  
**Fixture:** \`fixtures/innsegall-oar-surfaces.json\`  
**Regen:** \`npm run audit:oar\`

## Layer summary

| Layer | Gate |
|-------|------|
| 0 Canon | \`INNSEGALL_OPERATOR_VOICE.md\` + gospel + gtm-scope |
| 1 Persona | In voice doc §1 |
| 2 Surfaces | adoption-voice + landing-unity |
| 3 Corpus | en-coverage + apply-adoption-voice |
| 4 Gates | copy · client-facing · funnel |
| 5 Ship | commit · gate:launch |

## OAR run

${failed ? `**FAIL** · ${failed} layer(s) failed` : "**PASS** · all layers green"}

## Site matrix (${rows.length} HTML files)

| Page | Gospel/ai-bus | CTA | Lane copy | OG card | Locale picker |
|------|---------------|-----|-----------|---------|---------------|
${rows
  .sort((a, b) => a.rel.localeCompare(b.rel))
  .map((r) => `| ${r.rel} | ${r.gospel} | ${r.cta} | ${r.lane} | ${r.og} | ${r.locale} |`)
  .join("\n")}

## P0 drift (${issues.length})

${issues.length ? issues.map((i) => `- \`${i.rel}\` · gospel=${i.gospel} cta=${i.cta}`).join("\n") : "_None_"}

---

*Know you're okay · send the scout.*
`;

writeFileSync(join(root, "docs", "INNSEGALL_OAR_SITE_AUDIT_LATEST.md"), md, "utf8");
console.log(`\nWrote docs/INNSEGALL_OAR_SITE_AUDIT_LATEST.md · ${rows.length} pages · ${issues.length} drift flags`);

if (failed) {
  console.error(`\nOAR PASS FAIL · ${failed} layer(s)`);
  process.exit(1);
}
console.log("\nOAR PASS OK · Innsegall");
