#!/usr/bin/env node
/**
 * OAR layer 4 · operator voice bans + hero/CTA locks from fixtures/innsegall-oar-surfaces.json
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const surfaces = JSON.parse(
  readFileSync(join(root, "fixtures", "innsegall-oar-surfaces.json"), "utf8")
);
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 adoption-voice: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const voicePath = join(root, surfaces.operator_voice_doc || "docs/INNSEGALL_OPERATOR_VOICE.md");
check("operator voice doc", existsSync(voicePath));
const voice = existsSync(voicePath) ? readFileSync(voicePath, "utf8") : "";
check("voice primary CTA", voice.includes(surfaces.primary_cta));
check("voice tagline", voice.includes(surfaces.tagline_h1));

try {
  execSync("node scripts/audit-operator-voice.mjs", { cwd: root, stdio: "inherit" });
} catch {
  failed++;
}

const gospel = readFileSync(join(root, "src", "gospel.mjs"), "utf8");
check("gospel operator_voice_doc", gospel.includes("INNSEGALL_OPERATOR_VOICE.md"));

const llms = readFileSync(join(web, "llms.txt"), "utf8");
check("llms primary CTA", llms.includes(surfaces.primary_cta));

const skipLane = new Set(["tos.html", "privacy.html", "success.html"]);
for (const rel of surfaces.key_pages || []) {
  const path = join(web, rel);
  if (!existsSync(path)) {
    check(`${rel} exists`, false);
    continue;
  }
  const html = readFileSync(path, "utf8");
  if (!skipLane.has(rel)) {
    check(
      `${rel} primary CTA`,
      /Send the scout|Bring your clan|Get started|Mac scout/i.test(html)
    );
  }
  if (!skipLane.has(rel)) {
    const markers = surfaces.lane_markers || [];
    const hit = markers.some((m) => html.toLowerCase().includes(m.toLowerCase()));
    check(`${rel} lane marker (any)`, hit);
  }
}

const heroSpec = surfaces.heroes || {};
for (const [rel, spec] of Object.entries(heroSpec)) {
  const path = join(web, rel);
  if (!existsSync(path)) {
    check(`hero ${rel}`, false, "missing");
    continue;
  }
  const html = readFileSync(path, "utf8");
  if (spec.h1) check(`${rel} h1`, html.includes(spec.h1));
  for (const phrase of spec.must_include || []) {
    check(`${rel} includes ${phrase}`, html.includes(phrase));
  }
}

if (surfaces.chrome?.locale_picker) {
  const index = readFileSync(join(web, "index.html"), "utf8");
  check("locale picker chrome", index.includes("data-locale-picker"));
}
if (surfaces.chrome?.footer_credit) {
  const index = readFileSync(join(web, "index.html"), "utf8");
  check("footer AJ Nichols credit", index.includes(surfaces.chrome.footer_credit));
}

const indexOg = readFileSync(join(web, "index.html"), "utf8");
check(
  "index OG title",
  indexOg.includes(surfaces.og_title_fragment) || indexOg.includes("Know you're okay")
);

if (failed) {
  console.error(`\n${failed} adoption-voice failure(s)`);
  process.exit(1);
}
console.log("\nadoption-voice audit passed (OAR layer 4)");
