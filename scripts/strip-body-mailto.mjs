#!/usr/bin/env node
/**
 * Footer-only mailto · strip body mailto: links (keep plain tap@ text).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CONTACT_EMAIL } from "./contact-email.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const FOOTER_MARK = '<footer class="site-footer">';
const MAILTO_ANCHOR_RE = /<a\s+[^>]*href="mailto:[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

function stripMailtoAnchors(html) {
  return html.replace(MAILTO_ANCHOR_RE, (_, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text || /@$/.test(text)) return CONTACT_EMAIL;
    return text.replace(/hello@innsegall\.com/gi, CONTACT_EMAIL);
  });
}

function fixFile(absPath) {
  let html = readFileSync(absPath, "utf8");
  const before = html;

  html = html.replace(/hello@innsegall\.com/gi, CONTACT_EMAIL);
  html = html.replace(/mailto:hello@innsegall\.com[^"']*/gi, CONTACT_EMAIL);

  const footerIdx = html.indexOf(FOOTER_MARK);
  if (footerIdx >= 0) {
    const main = html.slice(0, footerIdx);
    const foot = html.slice(footerIdx);
    let fixedMain = stripMailtoAnchors(main);
    fixedMain = fixedMain.replace(
      /href="mailto:[^"]*"/gi,
      'href="#footer-tap"'
    );
    html = fixedMain + foot;
  } else {
    html = stripMailtoAnchors(html);
  }

  if (html !== before) writeFileSync(absPath, html, "utf8");
}

let n = 0;
for (const file of walkHtml(web)) {
  if (file.includes("/samples/")) continue;
  const prev = readFileSync(file, "utf8");
  fixFile(file);
  if (readFileSync(file, "utf8") !== prev) n++;
}
console.log(`strip-body-mailto: updated ${n} html file(s) · canon ${CONTACT_EMAIL}`);
