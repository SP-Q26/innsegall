/** Temporary deploy probe · swap to parley.js after confirming Vercel picks up commits. */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  return res.status(200).json({ service: "innsegall-parley", probe: "ok", method: req.method });
}
