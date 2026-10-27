/**
 * Innsegall web companion · iPhone / iPad · local inbox only.
 */
import {
  COMPANION_STORAGE_KEY,
  COMPANION_CHECKLIST_KEY,
  DEVICE_CHECKLIST,
  validateBattleScoutAi,
  inboxEntryKey,
  isFreeVoyageDay,
  nextFreeVoyageDate,
  formatVoyageLabel,
} from "./lib/companion-core.mjs";

const $ = (sel, root = document) => root.querySelector(sel);

function loadInbox() {
  try {
    const raw = localStorage.getItem(COMPANION_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveInbox(list) {
  localStorage.setItem(COMPANION_STORAGE_KEY, JSON.stringify(list));
}

function sortInbox(list) {
  return [...list].sort((a, b) => {
    const ta = a.report?.created_at || a.importedAt || "";
    const tb = b.report?.created_at || b.importedAt || "";
    return tb.localeCompare(ta);
  });
}

function upsertReport(report) {
  const key = inboxEntryKey(report);
  const now = new Date().toISOString();
  let list = loadInbox().filter((e) => e.key !== key);
  list.push({ key, importedAt: now, report });
  list = sortInbox(list).slice(0, 48);
  saveInbox(list);
  return list;
}

function triageClass(level) {
  if (level === "ESCALATE") return "companion-badge--escalate";
  if (level === "FIX_LIST") return "companion-badge--fix";
  return "companion-badge--ok";
}

function renderBadge(report) {
  const level = report.triage_level || report.verdict;
  const human = report.verdict_human || level;
  return `<p class="companion-badge ${triageClass(level)}" role="status">${human}</p>`;
}

function renderDetail(report) {
  const voyageTag = report.voyage
    ? `<p class="companion-voyage-tag" role="note">Voyage receipt · from scheduled Mac hygiene · not a live scan on this device.</p>`
    : "";
  const fixes = Array.isArray(report.fixes_recommended) ? report.fixes_recommended : [];
  const fixHtml = fixes.length
    ? `<ul class="companion-fix-list">${fixes
        .map((f) => `<li>${escapeHtml(f.title || f.name || String(f))}</li>`)
        .join("")}</ul>`
    : '<p class="companion-muted">No fix list items on this receipt.</p>';

  return `
    ${voyageTag}
    ${renderBadge(report)}
    <p class="companion-summary">${escapeHtml(report.summary)}</p>
    <p class="companion-meta">${escapeHtml(report.flow_label || report.flow)} · ${escapeHtml(
    report.created_at || "unknown time"
  )}</p>
    <h3 class="companion-h3">Recommended steps</h3>
    ${fixHtml}
    <p class="companion-scope">${escapeHtml(
      (report.does_not_check || []).slice(0, 3).join(" · ")
    )}</p>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInboxList(list, selectedKey) {
  const host = $("#companion-inbox-list");
  if (!host) return;
  if (!list.length) {
    host.innerHTML = `<p class="companion-muted">No reports yet · paste JSON from your Mac Battle Scout.</p>`;
    return;
  }
  host.innerHTML = list
    .map((entry) => {
      const r = entry.report;
      const active = entry.key === selectedKey ? " companion-inbox-item--active" : "";
      const title = escapeHtml(r.flow_label || r.flow || "Battle Scout");
      const sub = escapeHtml(r.verdict_human || r.verdict);
      return `<button type="button" class="companion-inbox-item${active}" data-key="${escapeHtml(
        entry.key
      )}">
        <span class="companion-inbox-title">${title}</span>
        <span class="companion-inbox-sub">${sub}</span>
      </button>`;
    })
    .join("");
  host.querySelectorAll(".companion-inbox-item").forEach((btn) => {
    btn.addEventListener("click", () => selectEntry(btn.dataset.key));
  });
}

function selectEntry(key) {
  const list = loadInbox();
  const entry = list.find((e) => e.key === key) || list[0];
  const detail = $("#companion-detail");
  if (!entry || !detail) return;
  detail.innerHTML = renderDetail(entry.report);
  detail.dataset.activeKey = entry.key;
  renderInboxList(list, entry.key);
  const del = $("#companion-delete");
  if (del) del.hidden = false;
}

function setStatus(msg, isError) {
  const el = $("#companion-status");
  if (!el) return;
  el.textContent = msg || "";
  el.classList.toggle("companion-status--error", Boolean(isError));
}

async function copyActiveForLlm() {
  const list = loadInbox();
  const key = $("#companion-detail")?.dataset.activeKey;
  const entry = list.find((e) => e.key === key);
  if (!entry) {
    setStatus("Select a report first.", true);
    return;
  }
  const text = JSON.stringify(entry.report, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Copied for LLM · paste into your assistant.");
  } catch {
    setStatus("Could not copy · use long-press on the paste field.", true);
  }
}

function importFromText(text) {
  const result = validateBattleScoutAi(text);
  if (!result.ok) {
    setStatus(result.error, true);
    return;
  }
  const list = upsertReport(result.report);
  setStatus("Imported · stored on this device only.");
  const key = inboxEntryKey(result.report);
  renderInboxList(list, key);
  selectEntry(key);
  const paste = $("#companion-paste");
  if (paste) paste.value = "";
}

async function loadSample() {
  const res = await fetch("/samples/battle-scout-ai-v1.sample.json");
  if (!res.ok) {
    setStatus("Could not load sample.", true);
    return;
  }
  const text = await res.text();
  importFromText(text);
}

function loadChecklistState() {
  try {
    const raw = localStorage.getItem(COMPANION_CHECKLIST_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function saveChecklistState(state) {
  localStorage.setItem(COMPANION_CHECKLIST_KEY, JSON.stringify(state));
}

function detectDeviceGuideHref() {
  const ua = navigator.userAgent || "";
  if (/iPad/.test(ua)) return "/tablet#bad-link";
  if (/iPhone|iPod/.test(ua)) return "/ios#bad-link";
  return "/#start-here";
}

function renderLightSignals() {
  const host = $("#companion-light-signals");
  if (!host) return;
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const secure = window.isSecureContext;
  const online = navigator.onLine;
  const clipboard = Boolean(navigator.clipboard?.writeText);
  const notif =
    typeof Notification !== "undefined" ? Notification.permission : "unsupported";
  const rows = [
    { ok: standalone, label: "Opened from Home Screen", hint: standalone ? "Good for inbox" : "Share → Add to Home Screen" },
    { ok: secure, label: "Secure connection", hint: secure ? "HTTPS" : "Use https://innsegall.com" },
    { ok: online, label: "Network", hint: online ? "Online · guides load" : "Offline · inbox still works" },
    { ok: clipboard, label: "Clipboard", hint: clipboard ? "Paste imports work" : "Long-press to paste" },
    {
      ok: notif === "denied" || notif === "default",
      label: "Notification permission",
      hint:
        notif === "granted"
          ? "Safari notifications on · review in Settings if spammy"
          : "We do not push scare alerts · optional",
    },
  ];
  host.innerHTML = `
    <ul class="companion-signal-list">
      ${rows
        .map(
          (r) =>
            `<li class="companion-signal companion-signal--${r.ok ? "ok" : "warn"}"><span class="companion-signal-label">${escapeHtml(
              r.label
            )}</span><span class="companion-signal-hint">${escapeHtml(r.hint)}</span></li>`
        )
        .join("")}
    </ul>
    <p class="companion-muted">Environment signals only · not a virus scan · <a href="${escapeHtml(
      detectDeviceGuideHref()
    )}">Open panic steps</a></p>
  `;
}

function wireDeviceChecklist() {
  const root = $("#companion-checklist-root");
  const progress = $("#companion-checklist-progress");
  if (!root) return;
  let state = loadChecklistState();

  function render() {
    const done = DEVICE_CHECKLIST.filter((item) => state[item.id]).length;
    if (progress) {
      progress.hidden = false;
      progress.textContent = `${done} of ${DEVICE_CHECKLIST.length} steps checked · saved on this device only`;
    }
    root.innerHTML = DEVICE_CHECKLIST
      .map((item) => {
        const checked = Boolean(state[item.id]);
        return `<li class="companion-checklist-item">
          <label>
            <input type="checkbox" data-check-id="${escapeHtml(item.id)}" ${checked ? "checked" : ""}>
            <span class="companion-checklist-label">${escapeHtml(item.label)}</span>
          </label>
          <p class="companion-checklist-detail">${escapeHtml(item.detail)} · <a href="${escapeHtml(
          item.guideHref
        )}">Guide</a></p>
        </li>`;
      })
      .join("");
    root.querySelectorAll("input[type=checkbox]").forEach((input) => {
      input.addEventListener("change", () => {
        state = { ...state, [input.dataset.checkId]: input.checked };
        saveChecklistState(state);
        render();
      });
    });
  }
  render();
}

function wireVoyage() {
  const el = $("#companion-voyage");
  if (!el) return;
  const now = new Date();
  const next = nextFreeVoyageDate(now);
  const today = isFreeVoyageDay(now);
  const list = sortInbox(loadInbox());
  const latestVoyage = list.find((e) => e.report?.voyage);
  const receiptLine = latestVoyage
    ? `<p class="companion-voyage-line">Latest Voyage in inbox · ${escapeHtml(
        latestVoyage.report.verdict_human || latestVoyage.report.verdict
      )} · tap receipt below.</p>`
    : "";
  el.innerHTML = `
    <p class="companion-voyage-line">${today ? "Today is a Voyage day · Mac opens the Battle Scout in your browser after <code>innsegall voyage</code>." : `Next free Voyage · ${formatVoyageLabel(next)} · ~10:00 local on Mac`}</p>
    ${receiptLine}
    <p class="companion-muted">Import <strong>Copy for LLM</strong> JSON from the Mac scout · Clan / MSP · Mon &amp; Thu on Mac. No checks run on this device.</p>
    <p><a class="btn-horn btn-horn--compact" href="/alpha">Mac field manual</a> · <a class="btn-horn btn-horn--compact companion-btn-ghost" href="/supplies">Supplies</a></p>
  `;
}

function init() {
  renderLightSignals();
  wireDeviceChecklist();
  wireVoyage();
  const list = sortInbox(loadInbox());
  saveInbox(list);
  renderInboxList(list, list[0]?.key);
  if (list[0]) selectEntry(list[0].key);

  $("#companion-import")?.addEventListener("click", () => {
    importFromText($("#companion-paste")?.value || "");
  });

  $("#companion-sample")?.addEventListener("click", () => {
    loadSample();
  });

  $("#companion-copy")?.addEventListener("click", () => {
    copyActiveForLlm();
  });

  $("#companion-delete")?.addEventListener("click", () => {
    const key = $("#companion-detail")?.dataset.activeKey;
    if (!key) return;
    const next = loadInbox().filter((e) => e.key !== key);
    saveInbox(next);
    renderInboxList(next, next[0]?.key);
    const detail = $("#companion-detail");
    if (next[0]) {
      selectEntry(next[0].key);
    } else if (detail) {
      detail.innerHTML = `<p class="companion-muted">Inbox empty.</p>`;
      detail.dataset.activeKey = "";
      $("#companion-delete").hidden = true;
    }
    setStatus("Removed from this device.");
  });

  $("#companion-file")?.addEventListener("change", async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    importFromText(text);
    ev.target.value = "";
  });

  if (window.matchMedia("(display-mode: standalone)").matches) {
    document.body.classList.add("companion-standalone");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
