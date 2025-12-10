export async function onRequest(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const weekId = url.searchParams.get("weekId");

  if (!weekId) {
    return new Response(JSON.stringify({ error: "weekId required" }), { status: 400 });
  }

  const result = await db.prepare(
    `SELECT o.opted_in_at,
            o.username,
            o.voucher_code,
            o.ip_address,
            d.mission_date,
            d.title AS mission_title
     FROM quest_optins o
     JOIN quest_days d ON d.id = o.quest_day_id
     WHERE d.week_id = ?
     ORDER BY o.opted_in_at DESC
     LIMIT 200`
  ).bind(weekId).all();

  return new Response(JSON.stringify(result.results || []), {
    headers: { "Content-Type": "application/json" }
  });
}
