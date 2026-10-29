#!/usr/bin/env node
/**
 * Home panic funnel · scare-first avenue selector · mobile install paths.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const hub = JSON.parse(readFileSync(join(root, "fixtures", "home-panic-funnel.json"), "utf8"));
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`FAIL home-panic: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

const index = readFileSync(join(web, "index.html"), "utf8");
const main = index.split('<main id="main">')[1] || index;

check("start-here before hero", main.indexOf('id="start-here"') < main.indexOf('class="hero"'));
check("avenue-selector present", index.includes("avenue-selector") && index.includes("avenue-card"));
check("device chips present", index.includes("home-device-chip") && index.includes("data-device-filter"));
check("scare panel hidden until device", index.includes("data-home-scare-panel") && index.includes("data-home-scare-hint"));
check("device chips before avenues", index.indexOf("home-device-chips") < index.indexOf("avenue-grid"));
check("colored device chips", index.includes("home-device-chip--iphone") && index.includes("home-device-chip--ipad") && index.includes("home-device-chip--mac"));
check("title scare-first", index.includes(hub.title));
check("avenue count in html", (index.match(/class="avenue-card"/g) || []).length >= hub.avenues.length);

for (const a of hub.avenues) {
  const href = a.href.startsWith("/blog/") ? a.href : a.href;
  check(`avenue href ${a.href}`, index.includes(`href="${href}"`) || index.includes(a.href));
}

check("iphone steps ios#bad-link", index.includes('/ios#bad-link'));
check("ipad steps tablet#bad-link", index.includes('/tablet#bad-link'));
check("mac popup guide", index.includes("/blog/fake-virus-popup-macintosh"));
check("hero links start-here", /href="#start-here"/.test(index));
check("hero primary panic CTA", /btn-horn[^>]*href="#start-here"/.test(index) || /href="#start-here"[^>]*class="[^"]*btn-horn/.test(index));
check("no pick your situation label", !index.includes("Pick your situation"));

const ios = readFileSync(join(web, "ios.html"), "utf8");
const tablet = readFileSync(join(web, "tablet.html"), "utf8");
check("ios install-companion", ios.includes('id="install-companion"'));
check("tablet install-companion", tablet.includes('id="install-companion"'));
check("install-ios exists", existsSync(join(web, "install-ios.html")));
check("install/ios nested route", existsSync(join(web, "install", "ios.html")));
check("install/tablet nested route", existsSync(join(web, "install", "tablet.html")));
check("install-tablet exists", existsSync(join(web, "install-tablet.html")));

const vercel = readFileSync(join(web, "vercel.json"), "utf8");
check("vercel /install/ios", vercel.includes('"/install/ios"'));
check("vercel /install/tablet", vercel.includes('"/install/tablet"'));

if (failed) {
  console.error(`\n${failed} home-panic funnel failure(s)`);
  process.exit(1);
}
console.log("\nHome panic funnel audit passed");
