#!/usr/bin/env node
/**
 * Four-inbox audit · tap@ canon in gospel/ai-bus · mailto only in site footer.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTACT_EMAIL } from "./contact-email.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const FOOTER_MARK = '<footer class="site-footer">';
let failed = 0;

const RETIRED = [
  { id: "hello@", pattern: /hello@innsegall\.com/i },
  { id: "help@", pattern: /help@innsegall\.com/i },
];

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 inbox: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const bus = JSON.parse(readFileSync(join(web, "innsegall-ai-bus.json"), "utf8"));
check("ai-bus contact", bus.contact === CONTACT_EMAIL);
const gospel = JSON.parse(readFileSync(join(web, ".well-known", "innsegall-gospel.json"), "utf8"));
check("gospel contact", gospel.contact === CONTACT_EMAIL);
check(
  "ai.txt contact",
  readFileSync(join(web, "ai.txt"), "utf8").includes(`contact: ${CONTACT_EMAIL}`)
);

const discovery = JSON.parse(readFileSync(join(web, ".well-known", "ai-discovery.json"), "utf8"));
if (discovery.contact) check("ai-discovery contact", discovery.contact === CONTACT_EMAIL);

const index = readFileSync(join(web, "index.html"), "utf8");
const orgBlock = index.match(/"@type":\s*"Organization"[\s\S]*?}/)?.[0] || "";
check("index org email", orgBlock.includes(CONTACT_EMAIL));

let bodyMailto = 0;
let retiredHits = 0;
for (const filePath of walkHtml(web)) {
  if (filePath.includes("/samples/")) continue;
  const rel = filePath.replace(web + "/", "");
  const html = readFileSync(filePath, "utf8");
  const footerIdx = html.indexOf('<footer class="site-footer">');
  const main = footerIdx >= 0 ? html.slice(0, footerIdx) : html;
  if (/mailto:/i.test(main)) {
    bodyMailto++;
    if (bodyMailto <= 5) console.error(`  body mailto: ${rel}`);
  }
  for (const r of RETIRED) {
    if (r.pattern.test(html)) {
      retiredHits++;
      if (retiredHits <= 5) console.error(`  retired ${r.id}: ${rel}`);
    }
  }
}
check("no body mailto links", bodyMailto === 0, `${bodyMailto} page(s)`);
check("no retired inboxes in html", retiredHits === 0, `${retiredHits} hit(s)`);

const footers = walkHtml(web).filter((filePath) => {
  const h = readFileSync(filePath, "utf8");
  return h.includes('class="site-footer"');
});
let footerMailto = 0;
for (const filePath of footers) {
  const foot = readFileSync(filePath, "utf8").split(FOOTER_MARK)[1] || "";
  if (!foot.includes(`mailto:${CONTACT_EMAIL}`)) footerMailto++;
}
check("footer mailto tap@", footerMailto === 0, `${footerMailto} missing`);

const pngPath = join(web, "icons/apple-touch-icon.png");
check("apple-touch png exists", existsSync(pngPath));
if (existsSync(pngPath)) {
  const buf = readFileSync(pngPath);
  check("apple-touch png size", buf.length > 500, `${buf.length} bytes`);
}

for (const filePath of walkHtml(web)) {
  if (filePath.includes("/samples/")) continue;
  const rel = filePath.replace(web + "/", "");
  const html = readFileSync(filePath, "utf8");
  if (/rel="apple-touch-icon"[^>]*favicon\.svg/.test(html)) {
    check(`${rel} apple-touch not svg`, false);
  }
}

if (failed) {
  console.error(`\n${failed} four-inbox failure(s)`);
  process.exit(1);
}
console.log("\nFour-inbox audit passed");
