#!/usr/bin/env node
/**
 * Phrase pass · Mac-user lens on static HTML (bodies + meta · skips script/json gospel blocks).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const web = join(dirname(fileURLToPath(import.meta.url)), "..", "web");

/** Order matters · longer phrases first */
const REPLACEMENTS = [
  ["Know you&apos;re okay · Macintosh triage", "Know you&apos;re okay · for your Mac"],
  ["Know you're okay · Macintosh triage", "Know you're okay · for your Mac"],
  ["Post-scare Mac triage:", "After a scary moment on your Mac:"],
  ["post-scare Mac triage,", "after a scary moment on your Mac,"],
  ["Post-scare guides", "Help after a scary moment"],
  ["Passage tiers", "Pricing"],
  ["The mist between", "When fear sells faster than facts"],
  ["Before you sail", "Before you start"],
  ["What the road asks", "What you need"],
  ["board the longship · Macintosh first", "Install on your Mac"],
  ["Alpha · board the longship · Macintosh first", "Install · Mac only"],
  ["Copy Terminal line", "Copy install line"],
  ["Copy aboard line", "Copy install line"],
  ["on your Macintosh", "on your Mac"],
  ["your Macintosh", "your Mac"],
  ["Your Macintosh", "Your Mac"],
  ["Macintosh users", "Mac users"],
  ["Macintosh first", "Mac first"],
  ["Macintosh ·", "Mac ·"],
  ["Macintosh triage", "Mac check"],
  ["Macintosh-specific", "Mac-specific"],
  ["Paste your Battle Scout to any AI", "Paste your report into any AI"],
  ["Arm any AI with your Battle Scout", "Paste your report into any AI"],
  ["Copy Battle Scout for AI", "Copy for AI"],
  ["Field manual · AI handoff", "Guide · paste into AI"],
  ["Open full demo</a> · public LIKELY_OK sample · not your Macintosh", "Open sample report</a> · demo only · not your Mac"],
  ["Open full demo</a> · not your Macintosh", "Open sample report</a> · not your Mac"],
  ["Field Report · category counts only · Voyage on the 1st &amp; 15th.", "Help articles · privacy-first · free checkups on the 1st &amp; 15th."],
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function stripBlocks(html) {
  return html
    .replace(/<!-- INNSEGALL_GOSPEL_START -->[\s\S]*?<!-- INNSEGALL_GOSPEL_END -->/g, (m) => m)
    .replace(/<script type="application\/json" id="innsegall-gospel">[\s\S]*?<\/script>/g, (m) => m)
    .replace(/<script type="application\/json" id="innsegall-ai-bus">[\s\S]*?<\/script>/g, (m) => m);
}

function applyFile(path) {
  let html = readFileSync(path, "utf8");
  const gospel = html.match(/<!-- INNSEGALL_GOSPEL_START -->[\s\S]*?<!-- INNSEGALL_GOSPEL_END -->/)?.[0] || "";
  const aiBus = html.match(/<!-- INNSEGALL_AI_BUS_START -->[\s\S]*?<!-- INNSEGALL_AI_BUS_END -->/)?.[0] || "";
  let body = html;
  if (gospel) body = body.replace(gospel, "%%GOSPEL%%");
  if (aiBus) body = body.replace(aiBus, "%%AIBUS%%");

  let next = body;
  for (const [from, to] of REPLACEMENTS) {
    if (next.includes(from)) next = next.split(from).join(to);
  }

  if (gospel) next = next.replace("%%GOSPEL%%", gospel);
  if (aiBus) next = next.replace("%%AIBUS%%", aiBus);

  if (next !== html) {
    writeFileSync(path, next, "utf8");
    return true;
  }
  return false;
}

let changed = 0;
for (const file of walk(web)) {
  if (applyFile(file)) {
    changed++;
    console.log(`mac-copy · ${file.replace(web + "/", "")}`);
  }
}
console.log(`apply-mac-user-copy done · ${changed} files`);
