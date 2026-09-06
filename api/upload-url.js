// /api/upload-url.js — Vercel serverless function
// Inatoa "signed upload URL" ili admin.html iweze kupakia faili LOLOTE
// (video, PDF, pptx, scratch .sb3, n.k) moja kwa moja Supabase Storage,
// bila kupitia kikomo cha ukubwa cha server ya Vercel.
//
// Env vars zinazohitajika (tayari zipo kwenye Vercel kutoka awali):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD
//
// Storage bucket "exam-files" lazima iundwe Supabase (Storage → New bucket → Public).

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'exam-files';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pw = req.headers['x-admin-password'];
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { path } = body || {};
    if (!path) return res.status(400).json({ error: 'Missing path' });

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) throw error;

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return res.status(200).json({
      bucket: BUCKET,
      path,
      token: data.token,
      publicUrl: pub.publicUrl
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
