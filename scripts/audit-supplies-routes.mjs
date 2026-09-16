#!/usr/bin/env node
/** Supplies / buy · CLI + web toll gate alignment. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
let failed = 0;

function check(name, ok) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  } else console.log(`ok: ${name}`);
}

const bin = readFileSync(join(root, "bin/innsegall.mjs"), "utf8");
check("CLI supplies command", bin.includes('case "supplies"'));
check("CLI buy alias", bin.includes('case "buy"'));
check("open supplies target", bin.includes("supplies: `${PRICING.site_url}/supplies`"));
check("openStripeCheckout wired", bin.includes("openStripeCheckout"));

check("supplies.html exists", existsSync(join(web, "supplies.html")));
const supplies = readFileSync(join(web, "supplies.html"), "utf8");
check("supplies checkout extra", supplies.includes('data-sku="extra"'));
check("supplies checkout clan", supplies.includes('data-sku="clan"'));
check("supplies terminal copy", supplies.includes("innsegall supplies extra"));
check("supplies companion link", supplies.includes("/companion"));

const vercel = readFileSync(join(web, "vercel.json"), "utf8");
check("vercel /supplies rewrite", vercel.includes('"/supplies"'));

const quota = readFileSync(join(root, "src/quota.mjs"), "utf8");
check("quota mentions supplies", quota.includes("innsegall supplies"));

console.log(failed ? `\n${failed} supplies-route failure(s)` : "\nSupplies routes audit passed");
process.exit(failed ? 1 : 0);
