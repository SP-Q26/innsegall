/** Parley API route alias · /api/innsegall-parley (probe path if /api/parley is stuck). */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  return res.status(200).json({ service: "innsegall-parley", alias: true, method: req.method });
}
