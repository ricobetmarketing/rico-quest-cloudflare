export async function onRequest(context) {
  const db = context.env.DB;

  const weeks = await db.prepare(
    "SELECT * FROM quest_weeks ORDER BY start_date ASC"
  ).all();

  return new Response(JSON.stringify(weeks.results || []), {
    headers: { "Content-Type": "application/json" }
  });
}
