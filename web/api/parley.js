/** Deploy probe · restore via node scripts/bundle-parley-api.mjs */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  return res.status(200).json({ service: "innsegall-parley", probe: "ok", method: req.method });
}
