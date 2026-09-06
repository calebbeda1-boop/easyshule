-- Run once in Supabase → SQL Editor

create table if not exists topics (
  id int primary key,
  label text not null
);

insert into topics (id, label) values
  (1,'DATA REPRESENTATION'), (2,'DATA TRANSMISSION'), (3,'HARDWARE'), (4,'SOFTWARE'),
  (5,'THE INTERNET'), (6,'EMERGING TECHNOLOGIES'), (7,'ALGORITHMS'), (8,'PROGRAMMING'),
  (9,'DATABASES'), (10,'BOOLEAN LOGIC')
on conflict (id) do nothing;

create table if not exists subtopics (
  id bigint generated always as identity primary key,
  topic_id int references topics(id) on delete cascade,
  title text not null,
  content_type text not null check (content_type in ('file','link')),
  file_ext text,
  url text not null,
  published boolean default true,
  created_at timestamptz default now()
);

alter table subtopics enable row level security;

-- Anyone (including the public index.html) can read published subtopics.
-- All writes go through /api/subtopics.js using the secret service role key,
-- which bypasses RLS entirely, so no insert/update/delete policy is needed here.
drop policy if exists "public read published" on subtopics;
create policy "public read published" on subtopics
  for select using (published = true);

-- Storage: create a bucket named "exam-files" from the Supabase dashboard
-- (Storage → New bucket → name it exam-files → toggle "Public").
-- No extra storage policy is needed: uploads only ever happen through the
-- signed upload URL minted by /api/upload-url.js (service role key), and
-- public reads are allowed automatically once the bucket is public.
