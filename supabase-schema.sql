-- ════════════════════════════════════════
-- Job Engine · Supabase Schema
-- Paste this into: Supabase → SQL Editor → Run
-- ════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Jobs table ──────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT        NOT NULL,
  company      TEXT        NOT NULL,
  location     TEXT,
  description  TEXT,
  url          TEXT        UNIQUE NOT NULL,
  source       TEXT,
  score        INTEGER     DEFAULT 0,
  verdict      TEXT        DEFAULT 'unreviewed',
  tags         TEXT[]      DEFAULT '{}',
  fetched_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Applications table ───────────────────
CREATE TABLE IF NOT EXISTS applications (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id           UUID        REFERENCES jobs(id) ON DELETE CASCADE,
  status           TEXT        DEFAULT 'Applied'
                               CHECK (status IN ('Applied','OA Received','Interview','Offer','Rejected','Ghosted')),
  applied_at       TIMESTAMPTZ DEFAULT NOW(),
  follow_up_date   TIMESTAMPTZ,
  notes            TEXT,
  tailored_resume  TEXT,
  outreach_message TEXT,
  cover_letter     TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jobs_score     ON jobs(score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_source    ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_fetched   ON jobs(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_apps_user      ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_status    ON applications(status);

-- ── Row Level Security ───────────────────
ALTER TABLE jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Jobs: all authenticated users can read; service role can write
CREATE POLICY "jobs_read_auth" ON jobs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "jobs_insert_service" ON jobs
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "jobs_update_service" ON jobs
  FOR UPDATE TO service_role USING (true);

-- Applications: users can only see/edit their own
CREATE POLICY "apps_select_own" ON applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "apps_insert_own" ON applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "apps_update_own" ON applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "apps_delete_own" ON applications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Done ─────────────────────────────────
SELECT 'Schema created successfully ✓' AS status;
