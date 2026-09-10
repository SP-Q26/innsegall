#!/usr/bin/env node
/**
 * Export issue_spotlight rows for publish-issue-spotlights.mjs
 *
 *   XANO_ISSUE_SPOTLIGHT_URL=https://…/innsegall/events?event=issue_spotlight
 *   XANO_API_KEY=sk_live_innsegall_ops_…
 *   node scripts/fetch-issue-spotlight-events.mjs --out .tmp/issue-events.json
 *
 * Or operator export:
 *   node scripts/fetch-issue-spotlight-events.mjs --from-file exports/xano-events.json
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function getArg(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : null;
}

const fromFile = getArg("from-file");
const outPath = getArg("out") || join(root, ".tmp", "issue-spotlight-events.json");
const days = Number(getArg("days") || "14");

function normalizePayload(row) {
  if (!row || typeof row !== "object") return null;
  const payload = row.payload && typeof row.payload === "object" ? row.payload : row;
  if (payload.event === "issue_spotlight" && payload.payload) {
    return payload.payload;
  }
  if (payload.issue_key && payload.event_type) return payload;
  return null;
}

function filterRecent(events) {
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const cut = cutoff.toISOString().slice(0, 10);
  return events.filter((e) => !e.day || e.day >= cut);
}

function parseFile(path) {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const rows = Array.isArray(raw) ? raw : raw.items || raw.data || [];
  return rows.map(normalizePayload).filter(Boolean);
}

async function fetchXano() {
  const url = process.env.XANO_ISSUE_SPOTLIGHT_URL;
  const key = process.env.XANO_API_KEY;
  if (!url || !key) {
    console.error("Set XANO_ISSUE_SPOTLIGHT_URL and XANO_API_KEY (see docs/ISSUE_SPOTLIGHT_LOOP.md)");
    process.exit(1);
  }
  const res = await fetch(url, {
    headers: { "X-API-Key": key, Accept: "application/json" },
  });
  if (!res.ok) {
    console.error(`Xano fetch ${res.status}: ${(await res.text()).slice(0, 200)}`);
    process.exit(1);
  }
  const raw = await res.json();
  const rows = Array.isArray(raw) ? raw : raw.items || raw.data || [];
  return rows.map(normalizePayload).filter(Boolean);
}

async function main() {
  let events;
  if (fromFile) {
    events = parseFile(fromFile);
    console.log(`loaded ${events.length} issue_spotlight payload(s) from ${fromFile}`);
  } else if (process.env.XANO_ISSUE_SPOTLIGHT_URL) {
    events = await fetchXano();
    console.log(`fetched ${events.length} issue_spotlight payload(s) from Xano`);
  } else {
    console.error("Provide --from-file=… or set XANO_ISSUE_SPOTLIGHT_URL + XANO_API_KEY");
    process.exit(1);
  }

  events = filterRecent(events);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(events, null, 2) + "\n", "utf8");
  console.log(`wrote ${outPath} (${events.length} events · last ${days} days)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
