/**
 * Copy Battle Scout AI paste to system clipboard (macOS pbcopy).
 */
import { execSync } from "node:child_process";
import { renderAiPaste } from "./render.mjs";

export function copyTextToClipboard(text) {
  if (!text) return { ok: false, reason: "empty" };
  if (process.platform === "darwin") {
    try {
      execSync("pbcopy", { input: text, stdio: ["pipe", "ignore", "ignore"] });
      return { ok: true };
    } catch {
      return { ok: false, reason: "pbcopy_failed" };
    }
  }
  return { ok: false, reason: "unsupported_platform" };
}

export function copyBattleScoutForAi(card) {
  return copyTextToClipboard(renderAiPaste(card));
}
