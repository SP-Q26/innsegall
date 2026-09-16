#!/usr/bin/env node
/**
 * Web companion (iPhone / iPad PWA) · no Apple Developer required.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateBattleScoutAi, COMPANION_FORMAT } from "../web/lib/companion-core.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");

let failed = 0;
function ok(label, pass) {
  if (pass) console.log(`ok: ${label}`);
  else {
    console.error(`FAIL: ${label}`);
    failed++;
  }
}

ok("companion.html exists", existsSync(join(web, "companion.html")));
ok("companion.webmanifest", existsSync(join(web, "companion.webmanifest")));
ok("innsegall-companion.js", existsSync(join(web, "innsegall-companion.js")));
ok("companion-core.mjs", existsSync(join(web, "lib", "companion-core.mjs")));
ok("WEB_COMPANION.md", existsSync(join(root, "docs", "WEB_COMPANION.md")));

const companionHtml = readFileSync(join(web, "companion.html"), "utf8");
ok("companion module script", companionHtml.includes('type="module"') && companionHtml.includes("innsegall-companion.js"));
ok("companion apple-mobile-web-app", companionHtml.includes("apple-mobile-web-app-capable"));
ok("companion manifest link", companionHtml.includes("/companion.webmanifest"));
ok("companion copy for LLM", companionHtml.includes("Copy for LLM"));
const companionJs = readFileSync(join(web, "innsegall-companion.js"), "utf8");
ok("companion voyage receipt tag", companionJs.includes("companion-voyage-tag"));
ok("companion supplies link", companionJs.includes("/supplies"));
ok("companion local-only copy", companionHtml.includes("stays in your browser") || companionHtml.includes("this device"));

const manifest = JSON.parse(readFileSync(join(web, "companion.webmanifest"), "utf8"));
ok("manifest start_url /companion", manifest.start_url === "/companion");
ok("manifest standalone", manifest.display === "standalone");

const vercel = readFileSync(join(web, "vercel.json"), "utf8");
ok("vercel rewrite /companion", vercel.includes('"/companion"'));

const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
ok("sitemap /companion", sitemap.includes("/companion"));

const ios = readFileSync(join(web, "ios.html"), "utf8");
const tablet = readFileSync(join(web, "tablet.html"), "utf8");
ok("ios links companion", ios.includes("/companion"));
ok("tablet links companion", tablet.includes("/companion"));

const llms = readFileSync(join(web, "llms.txt"), "utf8");
ok("llms companion url", llms.includes("/companion"));

const sample = readFileSync(join(web, "samples", "battle-scout-ai-v1.sample.json"), "utf8");
const valid = validateBattleScoutAi(sample);
ok("sample validates", valid.ok === true);
ok("validator rejects bad format", validateBattleScoutAi('{"format":"x"}').ok === false);

const coreJs = readFileSync(join(web, "lib", "companion-core.mjs"), "utf8");
ok("core format const", coreJs.includes(COMPANION_FORMAT));

const iosDoc = readFileSync(join(root, "docs", "IOS_PRODUCT.md"), "utf8");
ok("IOS_PRODUCT web companion", iosDoc.includes("WEB_COMPANION") || iosDoc.includes("web companion"));

console.log(failed ? `\n${failed} companion-web failure(s)` : "\nWeb companion audit passed · deploy /companion");
process.exit(failed ? 1 : 0);
