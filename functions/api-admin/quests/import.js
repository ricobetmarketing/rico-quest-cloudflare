import { json, handleOptions, requireAdmin } from "../../../_utils.js";

function validateWeek(w) {
  if (!w?.id || !w?.name || !w?.startDate || !w?.endDate) throw new Error("Week requires id,name,startDate,endDate");
}
function validateDay(d) {
  if (!d?.id || !d?.weekId || !d?.date || !d?.title || !d?.reward || !d?.voucherCode) {
    throw new Error("Day requires id,weekId,date,title,reward,voucherCode");
  }
  if (d.tnc && !Array.isArray(d.tnc)) throw new Error("tnc must be array");
}

export async function onRequest({ request, env }) {
  const opt = handleOptions(request);
  if (opt) return opt;

  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  try {
    requireAdmin(request, env);

    const body = await request.json().catch(() => ({}));
    const weeks = Array.isArray(body.weeks) ? body.weeks : [];
    const days = Array.isArray(body.days) ? body.days : [];
    const settings = Array.isArray(body.settings) ? body.settings : [];

    await env.DB.prepare(`DELETE FROM quest_days`).run();
    await env.DB.prepare(`DELETE FROM quest_weeks`).run();
    await env.DB.prepare(`DELETE FROM quest_settings`).run();

    for (const s of settings) {
      await env.DB.prepare(`INSERT INTO quest_settings (key, value) VALUES (?, ?)`)
        .bind(String(s.key), String(s.value ?? ""))
        .run();
    }

    for (const w of weeks) {
      validateWeek(w);
      await env.DB.prepare(`
        INSERT INTO quest_weeks (id, name, start_date, end_date, description, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(w.id, w.name, w.startDate, w.endDate, w.description || "").run();
    }

    for (const d of days) {
      const payload = {
        id: d.id || crypto.randomUUID(),
        weekId: d.weekId,
        date: d.date,
        label: d.label || "",
        title: d.title,
        provider: d.provider || "",
        reward: d.reward,
        voucherCode: d.voucherCode,
        tnc: Array.isArray(d.tnc) ? d.tnc : [],
        adminStatus: d.adminStatus || "auto",
        finalTag: d.finalTag || ""
      };
      validateDay(payload);

      await env.DB.prepare(`
        INSERT INTO quest_days (
          id, week_id, date, label, title, provider, reward, voucher_code,
          tnc_json, admin_status, final_tag, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        payload.id, payload.weekId, payload.date, payload.label, payload.title,
        payload.provider, payload.reward, payload.voucherCode,
        JSON.stringify(payload.tnc), payload.adminStatus, payload.finalTag
      ).run();
    }

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String(e?.message || e) }, e?.message === "Unauthorized" ? 401 : 500);
  }
}
