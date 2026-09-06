export function checkId(id, name) {
  return { id, name, status: "skipped", detail: "", evidence: [] };
}

export function pass(check, detail, evidence = []) {
  return { ...check, status: "pass", detail, evidence: evidence.slice(0, 10) };
}

export function warn(check, detail, evidence = []) {
  return { ...check, status: "warn", detail, evidence: evidence.slice(0, 10) };
}

export function fail(check, detail, evidence = []) {
  return { ...check, status: "fail", detail, evidence: evidence.slice(0, 10) };
}

export function tally(checks) {
  return checks.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    { pass: 0, warn: 0, fail: 0, skipped: 0 }
  );
}
