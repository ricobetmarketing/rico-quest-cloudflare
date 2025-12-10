export async function onRequestPost(context) {
  const db = context.env.DB;
  const req = context.request;

  const body = await req.json();
  const { id, title, slug, startDate, endDate, grandPrizeText, isActive } = body;

  if (!title || !slug || !startDate || !endDate) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  if (id) {
    // Update existing week
    await db.prepare(
      `UPDATE quest_weeks
       SET title = ?, slug = ?, start_date = ?, end_date = ?, grand_prize_text = ?, is_active = ?
       WHERE id = ?`
    ).bind(title, slug, startDate, endDate, grandPrizeText, isActive ? 1 : 0, id).run();
  } else {
    // Create new week
    await db.prepare(
      `INSERT INTO quest_weeks (title, slug, start_date, end_date, grand_prize_text, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(title, slug, startDate, endDate, grandPrizeText, isActive ? 1 : 0).run();
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
