export function computeVerdict(checks, userInputs = {}) {
  if (userInputs.entered_password) return "ESCALATE";
  if (
    userInputs.downloaded_file &&
    checks.some((c) => c.id === "recent_downloads" && c.status === "warn")
  ) {
    return "ESCALATE";
  }
  if (checks.some((c) => c.status === "fail")) return "ESCALATE";
  if (checks.some((c) => c.id === "adware_markers" && c.status === "warn")) {
    return "FIX_LIST";
  }
  if (checks.some((c) => c.status === "warn")) return "FIX_LIST";
  return "LIKELY_OK";
}

export function summaryLine(verdict, checks) {
  const n = checks.length;
  if (verdict === "LIKELY_OK") {
    return `We checked ${n} areas. Nothing scary. You're clear.`;
  }
  if (verdict === "FIX_LIST") {
    const w = checks.filter((c) => c.status === "warn").length;
    return `${w} small item(s) worth a look · not a dragon, just clutter.`;
  }
  return "Sound the Horn · or rotate passwords if you entered any on a suspicious page.";
}
