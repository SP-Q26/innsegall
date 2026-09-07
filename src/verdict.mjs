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
  const pass = checks.filter((c) => c.status === "pass").length;
  if (verdict === "LIKELY_OK") {
    return `We walked ${n} paths on your Mac. ${pass} came back clear. You're okay tonight.`;
  }
  if (verdict === "FIX_LIST") {
    const w = checks.filter((c) => c.status === "warn").length;
    const deeds = w === 1 ? "1 small deed" : `${w} small deeds`;
    return `${deeds} on the road · tidy work, not a siege. Follow **Do this now** below.`;
  }
  return "This scout needs your attention tonight. Start with **Do this now** · rotate any password you entered on a suspicious page, then Sound the Horn if you want help.";
}
