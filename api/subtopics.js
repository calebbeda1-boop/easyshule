// /api/subtopics.js — Vercel serverless function
// CRUD ya rasilimali za kila topic (subtopics): GET (umma, zilizo published),
// POST/DELETE (admin pekee, kwa x-admin-password header).
//
// Env vars zinazohitajika (tayari zipo kwenye Vercel kutoka awali):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function isAdmin(req) {
  const pw = req.headers['x-admin-password'];
  return pw && pw === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Wageni wa kawaida (index.html) wanaona rows zilizo published pekee.
      // Admin panel inatuma password header na kuona zote (hata zisizo published).
      let query = supabase.from('subtopics').select('*').order('created_at', { ascending: false });
      if (!isAdmin(req)) query = query.eq('published', true);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ subtopics: data });
    }

    if (req.method === 'POST') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { topic_id, title, content_type, file_ext, url } = body || {};
      if (!topic_id || !title || !content_type || !url) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const { data, error } = await supabase
        .from('subtopics')
        .insert([{ topic_id, title, content_type, file_ext, url, published: true }])
        .select();
      if (error) throw error;
      return res.status(200).json({ subtopic: data[0] });
    }

    if (req.method === 'DELETE') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('subtopics').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
