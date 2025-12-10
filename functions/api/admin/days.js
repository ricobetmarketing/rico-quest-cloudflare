export async function onRequest(context) {
  const db = context.env.DB;
  const url = new URL(context.request.url);
  const weekId = url.searchParams.get("weekId");

  if (!weekId) {
    return new Response(JSON.stringify({ error: "weekId required" }), { status: 400 });
  }

  const days = await db.prepare(
    "SELECT * FROM quest_days WHERE week_id = ? ORDER BY mission_date ASC"
  ).bind(weekId).all();

  return new Response(JSON.stringify(days.results || []), {
    headers: { "Content-Type": "application/json" }
  });
}
