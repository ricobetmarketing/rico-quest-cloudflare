export async function onRequest(context) {
  const db = context.env.DB;

  // Get all active weeks
  const weeks = await db.prepare(
    "SELECT * FROM quest_weeks WHERE is_active = 1 ORDER BY start_date ASC"
  ).all();

  const weekRows = weeks.results || [];
  const weekIds = weekRows.map(w => w.id);
  let daysByWeek = {};

  if (weekIds.length > 0) {
    const placeholders = weekIds.map(() => '?').join(',');
    const days = await db.prepare(
      `SELECT * FROM quest_days WHERE week_id IN (${placeholders}) AND is_enabled = 1 ORDER BY mission_date ASC`
    ).bind(...weekIds).all();

    const dayRows = days.results || [];
    daysByWeek = dayRows.reduce((map, row) => {
      if (!map[row.week_id]) map[row.week_id] = [];
      map[row.week_id].push({
        id: row.id,
        date: row.mission_date,
        label: row.label,
        title: row.title,
        provider: row.provider,
        voucherCode: row.voucher_code,
        reward: row.reward_text,
        tnc: JSON.parse(row.tnc_json)
      });
      return map;
    }, {});
  }

  const payload = weekRows.map(w => ({
    id: w.id,
    name: w.title,
    slug: w.slug,
    startDate: w.start_date,
    endDate: w.end_date,
    grandPrizeText: w.grand_prize_text,
    days: daysByWeek[w.id] || []
  }));

  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" }
  });
}
