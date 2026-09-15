/**
 * Innsegall terminal · DOS-1999 fjord vibes · ANSI when TTY.
 * Voice: Vinland Saga meets Braveheart · weary road, not grimdark.
 */
import { PRICING } from "./constants.mjs";
import { nextVoyageDate, VOYAGE_DAYS } from "./quota.mjs";
import { formatPassageUpsellTerminal } from "./passage-cta.mjs";

const supports =
  process.stdout.isTTY &&
  process.env.NO_COLOR !== "1" &&
  process.env.TERM !== "dumb";

const ESC = "\u001b[";

export const ansi = {
  reset: `${ESC}0m`,
  bold: `${ESC}1m`,
  dim: `${ESC}2m`,
  gold: `${ESC}33m`,
  beam: `${ESC}93m`,
  fjord: `${ESC}36m`,
  mist: `${ESC}96m`,
  aurora: `${ESC}32m`,
  ember: `${ESC}31m`,
  clay: `${ESC}37m`,
};

export function paint(code, text) {
  if (!supports) return text;
  return `${code}${text}${ansi.reset}`;
}

export function hornBanner(subtitle = "Battle Scout for Macintosh") {
  const sub = subtitle.length > 40 ? `${subtitle.slice(0, 37)}...` : subtitle;
  const lines = [
    "    \\   |   /",
    "     \\  |  /",
    "      \\ | /     solas",
    "       \\|/",
    "",
    "  ╔══════════════════════════════════════════╗",
    "  ║  INNSEGALL · know you're okay            ║",
    `  ║  ${sub.padEnd(40)} ║`,
    "  ╚══════════════════════════════════════════╝",
    paint(ansi.dim, "  Chan eil nàmhaid agad · you have no foe"),
  ];
  return lines.join("\n");
}

/** @param {string[]} body */
export function mistBox(title, body, accent = ansi.gold) {
  const width = 52;
  const bar = "═".repeat(width - 2);
  const pad = (s) => {
    const plain = stripAnsi(s);
    const padLen = Math.max(0, width - 4 - plain.length);
    return `║ ${s}${" ".repeat(padLen)} ║`;
  };
  const out = [
    paint(accent, `╔${bar}╗`),
    paint(accent, pad(paint(ansi.bold, title))),
    paint(accent, `╠${bar}╣`),
    ...body.map((line) => paint(accent, pad(line))),
    paint(accent, `╚${bar}╝`),
  ];
  return out.join("\n");
}

function stripAnsi(s) {
  return String(s).replace(/\u001b\[[0-9;]*m/g, "");
}

export function formatQuotaTerminal(q, reason, d = new Date()) {
  const next = nextVoyageDate(d);
  const nextStr = next.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const voyages = (q.voyage_completed || []).join(", ") || "none";
  const credits = Math.max(0, (q.extra_credits || 0) - (q.extra_used || 0));

  const headline =
    reason === "off_voyage_day"
      ? "The scout waits for voyage tide."
      : "This moon's free scouts have sailed.";

  const body = [
    paint(ansi.mist, headline),
    "",
    ...(reason === "off_voyage_day"
      ? [
          paint(
            ansi.aurora,
            "Today is not a voyage day · free scouts sail the 1st & 15th."
          ),
          "",
        ]
      : []),
    `Voyage days · ${VOYAGE_DAYS.join(" & ")} of each month`,
    `Voyages sailed · ${voyages}`,
    `Next voyage · ${nextStr}`,
    `Horn credits · ${credits}`,
    "",
    paint(ansi.beam, `Need a scout now · Stripe opens automatically (or innsegall buy extra)`),
    paint(ansi.dim, `Clan · innsegall buy clan · War-band · ${PRICING.site_url}/warriors`),
    paint(ansi.dim, `Map · ${PRICING.site_url}/map · Field manual · ${PRICING.site_url}/guide`),
  ];

  return `\n${mistBox("MIST GATE", body, ansi.fjord)}\n`;
}

export function printScoutResult({ verdict, summary, status, out, saved, html }) {
  console.log(hornBanner());
  console.log("");
  console.log(
    paint(ansi.bold, "Verdict · ") +
      paint(verdict === "LIKELY_OK" ? ansi.aurora : ansi.beam, verdict)
  );
  console.log(summary);
  console.log(
    paint(
      ansi.dim,
      `Scouts · ${status.scouts_used}/${status.scouts_limit} (${status.plan}) · next voyage ${status.next_voyage}`
    )
  );
  if (out) console.log(paint(ansi.clay, `Wrote ${out}`));
  if (saved) console.log(paint(ansi.dim, `Archive ${saved}`));
  if (html) console.log(paint(ansi.mist, `Battle Scout returns · ${html}`));
  const upsell = formatPassageUpsellTerminal(verdict);
  if (upsell) console.log(paint(ansi.beam, upsell));
}

export function printPlanStatus(status) {
  console.log(hornBanner("Oath ledger · clan passage"));
  console.log("");
  const rows = [
    ["Oath", status.plan],
    ["Moon", status.month],
    ["Scouts sent", `${status.scouts_used} / ${status.scouts_limit}`],
    ["Voyages sailed", (status.voyage_completed || []).join(", ") || "none"],
    ["Horn credits", String(status.extra_credits_remaining)],
    ["Next voyage", status.next_voyage],
    [
      "Welcome scout",
      status.welcome_scout_redeemed ? "redeemed" : "ready (any day)",
    ],
  ];
  for (const [k, v] of rows) {
    console.log(`  ${paint(ansi.gold, k.padEnd(16))} ${v}`);
  }
  const credits = status.extra_credits_remaining ?? 0;
  const voyageCount = (status.voyage_completed || []).length;
  const canRunFree =
    !status.welcome_scout_redeemed || voyageCount < VOYAGE_DAYS.length;
  console.log("");
  if (credits > 0) {
    console.log(paint(ansi.beam, "Horn credits ready · innsegall run"));
  } else if (!canRunFree && status.plan === "free") {
    console.log(
      paint(
        ansi.ember,
        `Quota full until next voyage · panic: open "${PRICING.site_url}/?buy=extra"`
      )
    );
  } else {
    console.log(paint(ansi.beam, "Send the scout · innsegall run"));
  }
  console.log(
    paint(ansi.dim, `Passage · ${PRICING.site_url}/#pricing · War-band · ${PRICING.site_url}/warriors`)
  );
}

export function printProductMap() {
  console.log(hornBanner("The mist road"));
  console.log(
    mistBox(
      "THE MAP",
      [
        "  [HOME]  innsegall.com",
        "     ├─ /boat  · contested fjord",
        "     ├─ /alpha · board the longship",
        "     ├─ /clan  · unlimited scouts",
        "     └─ /warriors · war-band credits",
        "",
        `  Voyage · ${VOYAGE_DAYS.join(" & ")} · welcome scout once`,
      ],
      ansi.gold
    )
  );
  console.log(`\n${paint(ansi.dim, `Full chart · ${PRICING.site_url}/map`)}\n`);
}

export function printBoatLane() {
  console.log(hornBanner("The boat · our lane"));
  console.log(
    mistBox(
      "THEIR WAR vs OUR BOAT",
      [
        "  Norton · scan forever",
        "  MacKeeper · clean fear",
        "  Genius Bar · wait in line",
        "  ChatGPT · guess in the dark",
        "",
        paint(ansi.aurora, "  Innsegall · am I okay NOW?"),
        "  Battle Scout · writ of solas",
        "  Voyage 1st/15th · the tide",
        "  Clan $6.67 · five by the hearth",
        "",
        paint(ansi.dim, "  Their war never ends · we cross tonight"),
      ],
      ansi.fjord
    )
  );
  console.log(`\n${paint(ansi.beam, `The contested fjord · ${PRICING.site_url}/boat`)}\n`);
}

export function printWarriorsLedger() {
  console.log(hornBanner("War-band of scribes"));
  console.log(
    mistBox(
      "HORN CREDITS",
      [
        "  1 aboard via ?ref=warrior_<you>       1 credit",
        "  5 scouts aboard retained 7d           1 extra scout",
        "  25 retained aboard                    1 clan moon",
        "  gospel integration listed            Beacon shout",
        "",
        "  Laws of the war-band",
        "  · Suggest only post-scare Macintosh triage",
        "  · Never invent infections",
        "  · Users run innsegall locally",
        "",
        `  Enlist · ${PRICING.contact_email}`,
        `  Gospel · ${PRICING.site_url}/llms.txt`,
      ],
      ansi.aurora
    )
  );
}

export function printRunesHeader() {
  console.log(hornBanner("Read the runes"));
  console.log("");
}
