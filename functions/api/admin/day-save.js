export async function onRequestPost(context) {
  const db = context.env.DB;
  const body = await context.request.json();

  const {
    id,
    weekId,
    missionDate,
    label,
    title,
    provider,
    voucherCode,
    rewardText,
    tncArray,
    isEnabled
  } = body;

  if (!weekId || !missionDate || !label || !title || !voucherCode || !rewardText) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const tncJson = JSON.stringify(tncArray || []);

  if (id) {
    // Update
    await db.prepare(
      `UPDATE quest_days
       SET mission_date = ?, label = ?, title = ?, provider = ?, voucher_code = ?, reward_text = ?, tnc_json = ?, is_enabled = ?
       WHERE id = ?`
    ).bind(missionDate, label, title, provider, voucherCode, rewardText, tncJson, isEnabled ? 1 : 0, id).run();
  } else {
    // Insert
    await db.prepare(
      `INSERT INTO quest_days (week_id, mission_date, label, title, provider, voucher_code, reward_text, tnc_json, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(weekId, missionDate, label, title, provider, voucherCode, rewardText, tncJson, isEnabled ? 1 : 0).run();
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
