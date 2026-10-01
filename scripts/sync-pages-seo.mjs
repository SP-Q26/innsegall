#!/usr/bin/env node
/**
 * Marketing pages · BreadcrumbList + WebPage JSON-LD · AI discovery link bundle.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const pack = JSON.parse(
  readFileSync(join(root, "fixtures", "pages-marketing-seo.json"), "utf8")
);

const LD_START = "<!-- INNSEGALL_PAGE_LD_START -->";
const LD_END = "<!-- INNSEGALL_PAGE_LD_END -->";

const AI_DISCOVERY = `  <link rel="alternate" type="text/plain" href="https://innsegall.com/llms.txt" title="Innsegall · AI agent gospel (llms.txt)">
  <link rel="alternate" type="text/plain" href="https://innsegall.com/ai.txt" title="Innsegall · AI discovery index">
  <link rel="describedby" href="https://innsegall.com/.well-known/innsegall-gospel.json" type="application/json">
  <link rel="alternate" type="application/json" href="https://innsegall.com/.well-known/ai-discovery.json" title="Innsegall · AI discovery manifest">
  <link rel="alternate" type="application/json" href="https://innsegall.com/innsegall-ai-bus.json" title="Innsegall · AI bus (compact agent context)">`;

function decodeDesc(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseHeadFields(html) {
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim() || "";
  const rawDesc = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || "";
  const description = decodeDesc(rawDesc);
  const url = html.match(/rel="canonical" href="([^"]+)"/)?.[1] || "";
  return { title, description, url };
}

function buildGraph(url, title, description, cfg) {
  const breadcrumbId = `${url}#breadcrumb`;
  const pageId = `${url}#webpage`;
  const graph = [
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Innsegall",
          item: "https://innsegall.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: cfg.breadcrumb,
          item: url,
        },
      ],
    },
    {
      "@type": cfg.webPageType || "WebPage",
      "@id": pageId,
      name: title.replace(/ · Innsegall$/, ""),
      description,
      url,
      inLanguage: pack.defaults.inLanguage,
      isPartOf: { "@id": "https://innsegall.com/#website" },
      publisher: { "@id": "https://innsegall.com/#organization" },
      breadcrumb: { "@id": breadcrumbId },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: pack.defaults.image,
      },
      ...(cfg.aboutSoftware
        ? { about: { "@id": "https://innsegall.com/#software" } }
        : {}),
    },
  ];

  if (cfg.webApplication) {
    graph.push({
      "@type": "WebApplication",
      "@id": `${url}#webapp`,
      name: "Innsegall Companion",
      url,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "iOS, iPadOS, Safari",
      description,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      isPartOf: { "@id": "https://innsegall.com/#software" },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

function upsertLd(html, blockJson) {
  const script = `${LD_START}\n  <script type="application/ld+json">\n  ${JSON.stringify(blockJson, null, 2)}\n  </script>\n  ${LD_END}`;
  const re = new RegExp(
    `${LD_START}[\\s\\S]*?${LD_END}`,
    "m"
  );
  if (re.test(html)) return html.replace(re, script);
  const anchor = "<!-- INNSEGALL_AI_BUS_END -->";
  if (html.includes(anchor)) {
    return html.replace(anchor, `${anchor}\n${script}`);
  }
  return html.replace("</head>", `${script}\n</head>`);
}

function ensureAiDiscovery(html) {
  if (html.includes("/ai-discovery.json")) return html;
  const canon = html.match(/rel="canonical" href="[^"]+">/)?.[0];
  if (!canon) return html;
  return html.replace(canon, `${canon}\n${AI_DISCOVERY}`);
}

let changed = 0;

for (const [file, cfg] of Object.entries(pack.pages)) {
  const path = join(web, file);
  let html = readFileSync(path, "utf8");
  const before = html;
  const { title, description, url } = parseHeadFields(html);
  if (!url) {
    console.warn(`skip ${file}: no canonical`);
    continue;
  }
  const graph = buildGraph(url, title, description, cfg);
  html = upsertLd(html, graph);
  html = ensureAiDiscovery(html);
  if (html !== before) {
    writeFileSync(path, html);
    changed++;
    console.log(`updated ${file}`);
  }
}

console.log(`sync-pages-seo done · ${changed} files`);
