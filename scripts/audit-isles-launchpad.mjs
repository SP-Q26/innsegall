#!/usr/bin/env node
/**
 * Isles launchpad audit · registry · docs · internal-only (no public /isles).
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 isles-launchpad: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

const docs = join(root, "docs/isles");
check("docs/isles/README.md", existsSync(join(docs, "README.md")));
check("LAUNCHPAD.md", existsSync(join(docs, "LAUNCHPAD.md")));
check("STACK_TEMPLATE.md", existsSync(join(docs, "STACK_TEMPLATE.md")));
check("STRIPE_METADATA.md", existsSync(join(docs, "STRIPE_METADATA.md")));
check("APPLE_BUNDLE_MAP.md", existsSync(join(docs, "APPLE_BUNDLE_MAP.md")));
check("GTM_MAC_FIRST.md", existsSync(join(docs, "GTM_MAC_FIRST.md")));
check("apps/INNSEGALL.md", existsSync(join(docs, "apps/INNSEGALL.md")));
check("apps/SIMPLE_PROPERTY.md", existsSync(join(docs, "apps/SIMPLE_PROPERTY.md")));

const launchpad = readFileSync(join(docs, "LAUNCHPAD.md"), "utf8");
check("tank 30 day", launchpad.includes("30"));
check("juvenile tank", launchpad.toLowerCase().includes("juvenile"));
check("Mac-first", launchpad.includes("Mac-first") || launchpad.includes("Mac-first"));

const registryPath = join(docs, "isles-app-registry.json");
check("isles-app-registry.json (internal)", existsSync(registryPath));
check("no public web registry", !existsSync(join(web, ".well-known/isles-app-registry.json")));
check("no public isles.html", !existsSync(join(web, "isles.html")));

let registry = {};
try {
  registry = JSON.parse(readFileSync(registryPath, "utf8"));
  check("registry schema", registry.schema === "isles-app-registry/v1");
  check("registry internal visibility", registry.visibility === "internal");
  check("registry future hub theisles.xyz", registry.public_hub_future === "theisles.xyz");
  check("registry innsegall app", (registry.apps || []).some((a) => a.app_id === "innsegall"));
  check("registry simple_property app", (registry.apps || []).some((a) => a.app_id === "simple_property"));
  check("registry spin mrr tripwire", registry.spin_out_tripwire_usd_mrr === 800);
  check("registry excludes spq", (registry.excluded_from_tank || []).some((x) => x.id === "spq"));
} catch (e) {
  check("registry parses", false, e.message);
}

check("isles-stripe-metadata.mjs", existsSync(join(web, "lib/isles-stripe-metadata.mjs")));
const catalog = readFileSync(join(web, "lib/stripe-catalog.mjs"), "utf8");
check("stripe catalog isles import", catalog.includes("isles-stripe-metadata"));
check("stripe catalog isles metadata helper", catalog.includes("innsegallStripeMetadata"));

const vercel = readFileSync(join(web, "vercel.json"), "utf8");
check("vercel no /isles rewrite", !vercel.includes('"/isles"'));

const portfolio = readFileSync(join(root, "docs/ISLES_PORTFOLIO.md"), "utf8");
check("portfolio internal visibility", portfolio.includes("Internal only") || portfolio.includes("internal"));
check("portfolio theisles.xyz note", portfolio.includes("theisles.xyz"));
check("portfolio links launchpad", portfolio.includes("docs/isles") || portfolio.includes("LAUNCHPAD"));

if (failed) {
  console.error(`\n${failed} isles-launchpad audit failure(s)`);
  process.exit(1);
}
console.log("\nIsles launchpad audit passed · internal canon only");
