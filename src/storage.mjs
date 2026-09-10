import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** Support dir · overridable via INNSEGALL_SUPPORT_DIR (tests, CI). */
function supportRoot() {
  return (
    process.env.INNSEGALL_SUPPORT_DIR ||
    join(homedir(), "Library/Application Support/Innsegall")
  );
}

function cardsDir() {
  return join(supportRoot(), "cards");
}

export function ensureDirs() {
  mkdirSync(cardsDir(), { recursive: true });
}

export function saveCard(card) {
  try {
    ensureDirs();
    const path = join(cardsDir(), `${card.card_id}.json`);
    writeFileSync(path, JSON.stringify(card, null, 2), "utf8");
    return path;
  } catch (e) {
    return null;
  }
}

export function listCards(limit = 20) {
  const dir = cardsDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const full = join(dir, f);
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
  return supportRoot();
}

/** Most recent card before cardId (by created_at). */
export function loadPreviousCard(currentCardId) {
  const list = listCards(20);
  for (const meta of list) {
    if (meta.card_id !== currentCardId) {
      return loadCardById(meta.card_id);
    }
  }
  return null;
}

export function loadCardById(cardId) {
  const dir = cardsDir();
  if (!existsSync(dir)) return null;
  const direct = join(dir, `${cardId}.json`);
  if (existsSync(direct)) {
    return JSON.parse(readFileSync(direct, "utf8"));
  }
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const card = JSON.parse(readFileSync(join(dir, f), "utf8"));
    if (card.card_id === cardId) return card;
  }
  return null;
}
