// GET /api/results — inatumiwa na admin.html kuonyesha matokeo ya wanafunzi wote.
// Inahitaji password sahihi (ADMIN_PASSWORD env var) kwenye header 'x-admin-password'.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = 'exam_submissions';

export default async function handler(req, res) {
  const pw = req.headers['x-admin-password'] || req.query.pw || '';
  if (!process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Password si sahihi.' });
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    res.status(500).json({ error: 'Storage haijawekwa.' });
    return;
  }

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=*&order=submitted_at.desc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(text || `Supabase error (${r.status})`);
    }
    const rows = await r.json();

    // Badilisha snake_case (Postgres) kuwa camelCase (kama admin.html inavyotarajia)
    const submissions = rows.map(row => ({
      id: row.id,
      name: row.name,
      cand: row.cand,
      cls: row.cls,
      rawTotal: row.raw_total,
      penaltyMarks: row.penalty_marks,
      totalCorrect: row.total_correct,
      totalMarks: row.total_marks,
      pct: row.pct,
      grade: row.grade,
      tabSwitchCount: row.tab_switch_count,
      submittedAt: row.submitted_at,
      receivedAt: row.received_at,
      pdfUrl: row.pdf_url || null
    }));

    res.status(200).json({ submissions });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
}
