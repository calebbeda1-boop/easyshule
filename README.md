# ICT Ground — full system (exam + results + resource-upload library)

## Muundo wa mradi
- `index.html` — home page (ring ya 3D + syllabus modal, sasa inasoma pia
  subtopics zilizopandishwa na admin kutoka database)
- `admin.html` — dashibodi ya mwalimu, tabu tatu: Matokeo, PDF za Mitihani,
  Pandisha Mitihani/Rasilimali
- `exams/data-representation.html` — mtihani halisi wa Data Representation
- `api/submit.js`, `api/results.js` — matokeo ya mtihani → Supabase
- `api/upload-url.js`, `api/subtopics.js` — mfumo mpya wa admin kupandisha
  rasilimali (faili lolote au link) kwa kila topic
- `assets/orbital/` — CSS/JS/picha za ukurasa mkuu
- `supabase-schema-subtopics.sql` — SQL ya kuunda majedwali `topics` na
  `subtopics` (haiathiri `exam_submissions` iliyopo)

## Hatua za usanidi (mara moja tu)

### 1. Endesha SQL mpya
Supabase → SQL Editor → New query → bandika content ya
`supabase-schema-subtopics.sql` → Run.

### 2. Unda Storage bucket mpya "exam-files"
Supabase → Storage → New bucket → jina: `exam-files` → washa "Public" → Save.
(Hii ni tofauti na bucket ya `marked-exams` iliyopo tayari — zote mbili zinahitajika.)

### 3. Chukua Anon Public Key
Supabase → Settings → API → nakili "anon public" key (siyo service_role).

### 4. Jaza admin.html
Fungua `admin.html`, tafuta mstari huu karibu na mwisho wa faili:
```js
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
```
Badilisha na URL na anon key za mradi wako halisi (zote mbili ni salama
kuonekana kwenye browser — zimelindwa na RLS + signed upload flow).

### 5. Env Variables kwenye Vercel
Hakikisha tayari zipo (kutoka usanidi wa awali):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` — hazihitaji
kuongezwa upya, `api/upload-url.js` na `api/subtopics.js` zinazitumia zile
zile.

### 6. Pakia faili zote kwenye GitHub, Commit, subiri Vercel ideploy
Vercel itaendesha `npm install` kiotomatiki kwa sababu ya `@supabase/supabase-js`
iliyoongezwa kwenye `package.json`.

## Jinsi mfumo unavyofanya kazi sasa
- Mwalimu anafungua `/admin.html` → tab "Pandisha Mitihani" → anachagua topic,
  anaandika jina la subtopic, anapakia faili (au anaweka link — mfano Scratch,
  Google Sheet) → anabofya "Pandisha".
- Faili linapakiwa moja kwa moja Supabase Storage (video/PDF/doc/pptx — aina
  yoyote), na taarifa zake zinahifadhiwa kwenye jedwali `subtopics`.
- `index.html` inapofunguliwa, inachukua orodha hii kiotomatiki (`/api/subtopics`)
  na kuichanganya na orodha tuli ya subtopics zilizopo kwenye code — bila
  kuhitaji kubadilisha faili lolote tena.
- Mwanafunzi akifungua panel husika kwenye ring, ataona subtopic mpya
  ikiwa kwenye orodha, tayari kubofywa.
