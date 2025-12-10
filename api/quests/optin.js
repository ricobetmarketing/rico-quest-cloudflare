// /api/quests/optin
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { voucherCode } = req.body || {};

  if (!voucherCode) {
    return res.status(400).json({ error: "voucherCode is required" });
  }

  // TODO: here you will save to DB / log to CRM
  console.log("New quest opt-in:", voucherCode);

  return res.status(200).json({ ok: true });
}
