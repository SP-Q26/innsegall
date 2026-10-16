#!/usr/bin/env node
/**
 * i18n readiness · EN gate must be green · no premature /es|/pt|/fr|/ar blog ship without plan.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function check(name, ok, detail = "") {
  if (!ok) {
    console.error(`P0 i18n-readiness: ${name}${detail ? ` · ${detail}` : ""}`);
    failed++;
  } else {
    console.log(`ok: ${name}`);
  }
}

try {
  execSync("node scripts/audit-en-post-scare-coverage.mjs", { cwd: root, stdio: "pipe" });
  check("EN coverage gate", true);
} catch {
  check("EN coverage gate", false, "run audit:en-coverage");
}

const plan = readFileSync(join(root, "docs", "LANE_I18N_PLAN.md"), "utf8");
check("i18n plan exists", plan.length > 200);
check("i18n plan phases es pt", plan.includes("pt-BR") || /portugu/i.test(plan));

const vercelJson = readFileSync(join(root, "web", "vercel.json"), "utf8");
const localeShipped =
  /"\/es\/blog"/.test(vercelJson) ||
  existsSync(join(root, "web", "es", "blog")) ||
  existsSync(join(root, "fixtures", "blog-i18n"));

if (localeShipped) {
  check("i18n fixture dir", existsSync(join(root, "fixtures", "blog-i18n")));
  check("es bundle", existsSync(join(root, "fixtures", "blog-i18n", "es.bundle.json")));
  check("pt-BR bundle", existsSync(join(root, "fixtures", "blog-i18n", "pt-BR.bundle.json")));
} else {
  check("i18n not shipped yet (expected)", true);
  check("EN gate documented in i18n plan", plan.includes("audit:en-coverage"));
}

const blogDir = join(root, "web", "blog");
const htmlCount = readdirSync(blogDir).filter((f) => f.endsWith(".html") && f !== "index.html").length;
check("EN blog depth", htmlCount >= 55, `count=${htmlCount}`);

if (failed) {
  console.error(`\n${failed} i18n readiness failure(s)`);
  process.exit(1);
}
console.log("\ni18n readiness PASS · EN complete · locales not live until plan phase 1");
