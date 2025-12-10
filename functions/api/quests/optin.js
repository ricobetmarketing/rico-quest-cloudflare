export async function onRequestPost(context) {
  const db = context.env.DB;
  const req = context.request;

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { voucherCode, userId, username } = body || {};
  if (!voucherCode || !userId || !username) {
    return new Response(JSON.stringify({ error: "voucherCode, userId, username required" }), { status: 400 });
  }

  // Find quest_day by voucher code
  const questDay = await db.prepare(
    "SELECT id FROM quest_days WHERE voucher_code = ? AND is_enabled = 1"
  ).bind(voucherCode).first();

  if (!questDay) {
    return new Response(JSON.stringify({ error: "Invalid or disabled voucher code" }), { status: 400 });
  }

  const userAgent = req.headers.get("User-Agent") || "";
  const ipAddress = req.headers.get("CF-Connecting-IP") || "";

  await db.prepare(
    "INSERT INTO quest_optins (user_id, username, quest_day_id, voucher_code, user_agent, ip_address) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(userId, username, questDay.id, voucherCode, userAgent, ipAddress).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
