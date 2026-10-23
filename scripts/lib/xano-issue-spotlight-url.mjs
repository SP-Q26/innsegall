/**
 * Resolve Xano export URL for issue_spotlight rows (GET · API key).
 *
 * Prefer XANO_ISSUE_SPOTLIGHT_URL · else derive from XANO_EVENTS_URL:
 *   …/innsegall/events  →  …/innsegall/issue_spotlight
 */
export function resolveIssueSpotlightExportUrl() {
  const explicit = process.env.XANO_ISSUE_SPOTLIGHT_URL?.trim();
  if (explicit) return explicit;

  const eventsUrl = process.env.XANO_EVENTS_URL?.trim();
  if (!eventsUrl) return null;

  if (/\/innsegall\/events\/?$/i.test(eventsUrl)) {
    return eventsUrl.replace(/\/innsegall\/events\/?$/i, "/innsegall/issue_spotlight");
  }

  const base = eventsUrl.replace(/\/$/, "");
  return `${base}/issue_spotlight`;
}

export function hasIssueSpotlightXanoEnv() {
  return Boolean(process.env.XANO_API_KEY?.trim() && resolveIssueSpotlightExportUrl());
}
