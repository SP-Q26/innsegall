/** Public demo Battle Scout · synthetic LIKELY_OK · no live paths or PII */
import { ENGINE_VERSION, FLOWS, PRODUCT, SCHEMA_VERSION } from "./constants.mjs";
import { summaryLine } from "./verdict.mjs";

const DEMO_CHECKS = [
  { id: "launch_ghosts", name: "Launch ghosts", status: "pass", detail: "No unexpected login items flagged.", evidence: [] },
  { id: "adware_markers", name: "Adware markers", status: "pass", detail: "No known scareware patterns in common spots.", evidence: [] },
  { id: "hosts_file", name: "Hosts file", status: "pass", detail: "Hosts file looks ordinary.", evidence: [] },
  { id: "dns_resolvers", name: "DNS resolvers", status: "pass", detail: "Resolver settings read clean.", evidence: [] },
  { id: "system_proxy", name: "System proxy", status: "pass", detail: "No suspicious proxy hijack.", evidence: [] },
  { id: "gatekeeper", name: "Gatekeeper", status: "pass", detail: "Gatekeeper enabled as expected.", evidence: [] },
  { id: "security_software", name: "Security software", status: "pass", detail: "No conflicting scareware tools detected.", evidence: [] },
  { id: "firefox_profile", name: "Firefox profile", status: "pass", detail: "Extensions within normal range.", evidence: [] },
  { id: "safari_profile", name: "Safari profile", status: "pass", detail: "Safari extensions look familiar.", evidence: [] },
  { id: "chrome_profile", name: "Chrome profile", status: "pass", detail: "Chrome extensions within normal range.", evidence: [] },
  { id: "login_items", name: "Login items", status: "pass", detail: "Login items match what you'd expect.", evidence: [] },
  { id: "recent_installs", name: "Recent installs", status: "pass", detail: "No surprise installers in the last week.", evidence: [] },
  { id: "config_profiles", name: "Configuration profiles", status: "pass", detail: "No unknown MDM or profiles.", evidence: [] },
];

export function buildDemoCard() {
  const checks = DEMO_CHECKS;
  const verdict = "LIKELY_OK";
  return {
    schema_version: SCHEMA_VERSION,
    card_id: "demo-public-likely-ok",
    created_at: new Date().toISOString(),
    product: PRODUCT,
    brand: PRODUCT,
    flow: "mac_hygiene",
    flow_label: FLOWS.mac_hygiene,
    platform: "macos",
    platform_version: "14.0 (demo)",
    verdict,
    summary: summaryLine(verdict, checks),
    stats: { pass: checks.length, warn: 0, fail: 0 },
    checks_run: checks,
    fixes_recommended: [],
    project_watch: null,
    user_inputs: { entered_password: false, downloaded_file: false },
    redactions: [],
    engine_version: ENGINE_VERSION,
    signature: null,
    voyage: false,
    smoke: false,
    demo: true,
    demo_label: "PUBLIC DEMO · sample Battle Scout · run Innsegall on your Macintosh for your own receipt",
  };
}
