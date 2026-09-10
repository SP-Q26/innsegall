#!/usr/bin/env node
/**
 * Discovery + trust audit · directories playbook · stability · open engine surfaces.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 discovery: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

check("CHANGELOG.md", existsSync(join(root, "CHANGELOG.md")));
check("CODE_OF_CONDUCT.md", existsSync(join(root, "CODE_OF_CONDUCT.md")));
check("docs/STABILITY.md", existsSync(join(root, "docs/STABILITY.md")));
check("docs/DISTRIBUTION_PLAYBOOK.md", existsSync(join(root, "docs/DISTRIBUTION_PLAYBOOK.md")));
check("docs/HOMEBREW.md", existsSync(join(root, "docs/HOMEBREW.md")));
check("packaging/homebrew/innsegall.rb", existsSync(join(root, "packaging/homebrew/innsegall.rb")));
check("community r/macapps template", existsSync(join(root, "docs/pastes/community-r-macapps.md")));

const alpha = readFileSync(join(web, "alpha.html"), "utf8");
check("alpha one-click installer link", alpha.includes("Innsegall-Install.command"));
const gospelJson = readFileSync(join(web, ".well-known", "innsegall-gospel.json"), "utf8");
check("gospel one_click in well-known", gospelJson.includes("one_click") || gospelJson.includes("Innsegall-Install"));

const stability = existsSync(join(web, "stability.html"))
  ? readFileSync(join(web, "stability.html"), "utf8")
  : "";
check("stability.html page", stability.includes("Stability"));
check("stability MIT github", stability.includes("github.com/SP-Q26/innsegall"));
check("stability battle-scout v1", stability.includes("innsegall-battle-scout-ai/v1"));

const llms = readFileSync(join(web, "llms.txt"), "utf8");
check("llms github", llms.includes("github.com/SP-Q26/innsegall"));
check("llms stability url", llms.includes("innsegall.com/stability"));

const guide = readFileSync(join(web, "guide.html"), "utf8");
check("guide open engine section", guide.includes("Open engine") || guide.includes("github.com/SP-Q26/innsegall"));
check("guide stability link", guide.includes("/stability"));

const sitemap = readFileSync(join(web, "sitemap.xml"), "utf8");
check("sitemap stability", sitemap.includes("/stability"));

const vercel = readFileSync(join(web, "vercel.json"), "utf8");
check("vercel stability rewrite", vercel.includes('"/stability"'));

const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");
check("changelog 0.4.0-alpha", changelog.includes("0.4.0-alpha"));

if (failed) {
  console.error(`\n${failed} discovery/trust audit failure(s)`);
  process.exit(1);
}
console.log("\nDiscovery audit passed · playbook + stability + open engine");
