// Vercel Serverless Function — POST /api/generate-lesson-plan
//
// Hii inakaa "server-side" (siyo kwenye kivinjari cha mtumiaji), ndiyo
// maana ANTHROPIC_API_KEY iko salama hapa — haionekani kamwe kwa mtu
// anayetazama chanzo (view-source) cha website.
//
// Weka ufunguo wako kwenye Vercel:
//   Project → Settings → Environment Variables
//   Name:  ANTHROPIC_API_KEY
//   Value: (ufunguo wako kutoka console.anthropic.com)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'ANTHROPIC_API_KEY haijawekwa kwenye Vercel Environment Variables.'
    });
    return;
  }

  const { subject, grade, topic, duration, language, notes } = req.body || {};

  if (!subject || !topic) {
    res.status(400).json({ error: 'Subject na Topic ni lazima.' });
    return;
  }

  const prompt = `Wewe ni mtaalamu wa mitaala ya elimu Tanzania (Competency Based Curriculum). Tengeneza mpango wa somo (lesson plan) kamili na wa kina kwa taarifa zifuatazo:
Somo: ${subject}
Darasa/Kidato: ${grade || "Haijabainishwa"}
Mada: ${topic}
Muda wa kipindi: ${duration || "40"} dakika
Lugha ya kufundishia: ${language || "Kiswahili"}
Maelezo ya ziada kutoka kwa mwalimu: ${notes || "Hakuna"}

Jibu KWA JSON pekee, bila maandishi mengine yoyote nje ya JSON wala alama za markdown, ukitumia muundo huu hasa:
{
  "malengo": ["lengo 1", "lengo 2", "lengo 3"],
  "vifaa": ["kifaa 1", "kifaa 2"],
  "maarifa_tangulizi": "maelezo mafupi ya maarifa ambayo mwanafunzi anatakiwa awe nayo kabla ya somo",
  "hatua": [
    {"jina": "Utangulizi", "muda": "dakika 5", "maelezo": "maelezo ya kina ya shughuli za mwalimu na wanafunzi"},
    {"jina": "Ukuzaji", "muda": "dakika 25", "maelezo": "maelezo ya kina ya shughuli, hatua kwa hatua, ikijumuisha mifano"},
    {"jina": "Hitimisho", "muda": "dakika 10", "maelezo": "maelezo ya kina ya jinsi somo litakavyofungwa"}
  ],
  "tathmini": "jinsi mwalimu atakavyopima uelewa wa wanafunzi",
  "kazi_ya_nyumbani": "kazi ya ziada kwa wanafunzi"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: 'Anthropic API error: ' + errText });
      return;
    }

    const data = await response.json();
    const rawText = (data.content || []).map((b) => b.text || '').join('\n');
    const clean = rawText.replace(/```json|```/g, '').trim();

    let planJson;
    try {
      planJson = JSON.parse(clean);
    } catch (parseErr) {
      res.status(502).json({ error: 'AI ilirudisha muundo usiotarajiwa. Jaribu tena.' });
      return;
    }

    res.status(200).json(planJson);
  } catch (err) {
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
