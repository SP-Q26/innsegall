/**
 * Fixture build translators · gtx with backoff · MyMemory fallback.
 * @param {string} text
 * @param {string} target es | pt | ...
 * @param {string} [source=en]
 */
export async function translateText(text, target, source = "en") {
  const q = String(text || "").trim();
  if (!q) return "";
  const max = 1800;
  if (q.length <= max) return await translateChunk(q, target, source);
  const parts = [];
  let i = 0;
  while (i < q.length) {
    let end = Math.min(i + max, q.length);
    if (end < q.length) {
      const slice = q.slice(i, end);
      const lastSpace = slice.lastIndexOf(" ");
      if (lastSpace > max * 0.5) end = i + lastSpace;
    }
    parts.push(await translateChunk(q.slice(i, end), target, source));
    i = end;
    await sleep(250);
  }
  return parts.join("");
}

async function translateChunk(q, target, source) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const gtx = await gtxTranslate(q, target, source);
      if (gtx) return gtx;
    } catch (e) {
      if (String(e.message || e).includes("429")) {
        await sleep(800 * (attempt + 1));
        continue;
      }
    }
    break;
  }
  const mm = await myMemoryTranslate(q, target, source);
  if (mm) return mm;
  return q;
}

async function gtxTranslate(q, target, source) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
    encodeURIComponent(source) +
    "&tl=" +
    encodeURIComponent(target) +
    "&dt=t&q=" +
    encodeURIComponent(q);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data?.[0])) return null;
  return data[0].map((row) => row[0] || "").join("");
}

async function myMemoryTranslate(q, target, source) {
  const pair = `${source}|${target === "pt" ? "pt-BR" : target}`;
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(q.slice(0, 480)) +
    "&langpair=" +
    encodeURIComponent(pair);
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (!out || out === q) return out || null;
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
