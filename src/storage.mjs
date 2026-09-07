import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SUPPORT = process.env.INNSEGALL_SUPPORT_DIR || join(homedir(), "Library/Application Support/Innsegall");
const CARDS_DIR = join(SUPPORT, "cards");

export function ensureDirs() {
  mkdirSync(CARDS_DIR, { recursive: true });
}

export function saveCard(card) {
  try {
    ensureDirs();
    const path = join(CARDS_DIR, `${card.card_id}.json`);
    writeFileSync(path, JSON.stringify(card, null, 2), "utf8");
    return path;
  } catch (e) {
    return null;
  }
}

export function listCards(limit = 20) {
  if (!existsSync(CARDS_DIR)) return [];
  return readdirSync(CARDS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const full = join(CARDS_DIR, f);
      try {
        const card = JSON.parse(readFileSync(full, "utf8"));
        return {
          path: full,
          card_id: card.card_id,
          created_at: card.created_at,
          verdict: card.verdict,
          flow: card.flow,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, limit);
}

export function supportPath() {
  return SUPPORT;
}

export function loadCardById(cardId) {
  if (!existsSync(CARDS_DIR)) return null;
  const direct = join(CARDS_DIR, `${cardId}.json`);
  if (existsSync(direct)) {
    return JSON.parse(readFileSync(direct, "utf8"));
  }
  for (const f of readdirSync(CARDS_DIR)) {
    if (!f.endsWith(".json")) continue;
    const card = JSON.parse(readFileSync(join(CARDS_DIR, f), "utf8"));
    if (card.card_id === cardId) return card;
  }
  return null;
}
