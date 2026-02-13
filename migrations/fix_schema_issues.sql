-- ===========================================
-- CONSOLIDATED MIGRATION
-- ===========================================
-- Run this on an existing database (created from the original supabase_schema.sql)
-- to bring it up to date with new_supabase_schema.sql
-- Safe to re-run (uses IF NOT EXISTS / IF EXISTS throughout)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- 1. ADD MISSING TABLES & COLUMNS
-- ===========================================
-- These must come before the constraint/index fixes below

-- Add token column to response (was added after initial schema)
ALTER TABLE response ADD COLUMN IF NOT EXISTS token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_response_token_unique ON response(token) WHERE token IS NOT NULL;

-- Create candidate table if it doesn't exist
CREATE TABLE IF NOT EXISTS candidate (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    email TEXT,
    name TEXT,
    full_name TEXT,
    phone TEXT,
    gender TEXT,
    country TEXT,
    social_media_links JSONB,
    work_experience JSONB
);

-- Add candidate_id to response
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'response' AND column_name = 'candidate_id'
    ) THEN
        ALTER TABLE response ADD COLUMN candidate_id INTEGER REFERENCES candidate(id);
    END IF;
END $$;

-- Add portfolio_website to candidate
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'candidate' AND column_name = 'portfolio_website'
    ) THEN
        ALTER TABLE candidate ADD COLUMN portfolio_website TEXT;
    END IF;
END $$;

-- Remove theme_color from interview (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'interview' AND column_name = 'theme_color'
    ) THEN
        ALTER TABLE interview DROP COLUMN theme_color;
    END IF;
END $$;

-- Add call flow state tracking to response
ALTER TABLE response ADD COLUMN IF NOT EXISTS call_flow_state JSONB DEFAULT '{}';

-- Add session security columns to response
ALTER TABLE response
ADD COLUMN IF NOT EXISTS active_session_id TEXT,
ADD COLUMN IF NOT EXISTS session_fingerprint TEXT,
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ;

-- ===========================================
-- 2. FIX CONSTRAINTS & DEFAULTS
-- ===========================================

-- Organization
ALTER TABLE organization
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN allowed_responses_count SET DEFAULT 0,
    ALTER COLUMN allowed_responses_count SET NOT NULL,
    ALTER COLUMN plan SET DEFAULT 'free',
    ALTER COLUMN plan SET NOT NULL;

-- User
ALTER TABLE "user"
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN email SET NOT NULL;

ALTER TABLE "user"
    ADD CONSTRAINT user_email_check
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE "user"
    DROP CONSTRAINT IF EXISTS user_organization_id_fkey,
    ADD CONSTRAINT user_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE;

-- Interviewer
ALTER TABLE interviewer
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE interviewer
    ADD CONSTRAINT interviewer_empathy_check CHECK (empathy >= 0 AND empathy <= 100),
    ADD CONSTRAINT interviewer_exploration_check CHECK (exploration >= 0 AND exploration <= 100),
    ADD CONSTRAINT interviewer_rapport_check CHECK (rapport >= 0 AND rapport <= 100),
    ADD CONSTRAINT interviewer_speed_check CHECK (speed >= 0 AND speed <= 100);

-- Interview
ALTER TABLE interview
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN is_active SET NOT NULL,
    ALTER COLUMN is_anonymous SET NOT NULL,
    ALTER COLUMN is_archived SET NOT NULL;

ALTER TABLE interview
    ALTER COLUMN questions SET DEFAULT '[]'::jsonb,
    ALTER COLUMN quotes SET DEFAULT ARRAY[]::JSONB[],
    ALTER COLUMN insights SET DEFAULT ARRAY[]::TEXT[],
    ALTER COLUMN respondents SET DEFAULT ARRAY[]::TEXT[];

ALTER TABLE interview
    DROP CONSTRAINT IF EXISTS interview_organization_id_fkey,
    ADD CONSTRAINT interview_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES organization(id) ON DELETE CASCADE;

ALTER TABLE interview
    DROP CONSTRAINT IF EXISTS interview_user_id_fkey,
    ADD CONSTRAINT interview_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;

ALTER TABLE interview
    DROP CONSTRAINT IF EXISTS interview_interviewer_id_fkey,
    ADD CONSTRAINT interview_interviewer_id_fkey
    FOREIGN KEY (interviewer_id) REFERENCES interviewer(id) ON DELETE SET NULL;

-- Candidate
ALTER TABLE candidate
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE candidate
    ALTER COLUMN social_media_links SET DEFAULT '{}'::jsonb,
    ALTER COLUMN work_experience SET DEFAULT '[]'::jsonb;

ALTER TABLE candidate
    ADD CONSTRAINT candidate_email_check
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Response
ALTER TABLE response
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN interview_id SET NOT NULL,
    ALTER COLUMN token SET NOT NULL,
    ALTER COLUMN is_analysed SET NOT NULL,
    ALTER COLUMN is_ended SET NOT NULL,
    ALTER COLUMN is_viewed SET NOT NULL;

ALTER TABLE response
    ALTER COLUMN details SET DEFAULT '{}'::jsonb,
    ALTER COLUMN analytics SET DEFAULT '{}'::jsonb,
    ALTER COLUMN tab_switch_count SET DEFAULT 0;

ALTER TABLE response
    ADD CONSTRAINT response_duration_check CHECK (duration IS NULL OR duration >= 0);

ALTER TABLE response
    ADD CONSTRAINT response_email_check
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE response
    DROP CONSTRAINT IF EXISTS response_interview_id_fkey,
    ADD CONSTRAINT response_interview_id_fkey
    FOREIGN KEY (interview_id) REFERENCES interview(id) ON DELETE CASCADE;

ALTER TABLE response
    DROP CONSTRAINT IF EXISTS response_candidate_id_fkey,
    ADD CONSTRAINT response_candidate_id_fkey
    FOREIGN KEY (candidate_id) REFERENCES candidate(id) ON DELETE SET NULL;

-- Feedback
ALTER TABLE feedback
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN interview_id SET NOT NULL;

ALTER TABLE feedback
    ADD CONSTRAINT feedback_satisfaction_check
    CHECK (satisfaction IS NULL OR (satisfaction >= 1 AND satisfaction <= 5));

ALTER TABLE feedback
    ADD CONSTRAINT feedback_email_check
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE feedback
    DROP CONSTRAINT IF EXISTS feedback_interview_id_fkey,
    ADD CONSTRAINT feedback_interview_id_fkey
    FOREIGN KEY (interview_id) REFERENCES interview(id) ON DELETE CASCADE;

-- ===========================================
-- 3. INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_user_organization_id ON "user"(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_interview_readable_slug_unique ON interview(readable_slug) WHERE readable_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interview_organization_id ON interview(organization_id);
CREATE INDEX IF NOT EXISTS idx_interview_user_id ON interview(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_is_active ON interview(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_interview_readable_slug ON interview(readable_slug);

CREATE INDEX IF NOT EXISTS idx_candidate_email ON candidate(email) WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_response_token ON response(token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_response_interview_email_unique
ON response(interview_id, email)
WHERE email IS NOT NULL AND is_ended = false;
CREATE INDEX IF NOT EXISTS idx_response_interview_id ON response(interview_id);
CREATE INDEX IF NOT EXISTS idx_response_candidate_id ON response(candidate_id) WHERE candidate_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_response_call_id ON response(call_id) WHERE call_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_response_is_ended ON response(is_ended) WHERE is_ended = false;
CREATE INDEX IF NOT EXISTS idx_response_email ON response(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_response_active_session ON response(active_session_id) WHERE active_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_response_last_heartbeat ON response(last_heartbeat) WHERE last_heartbeat IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_interview_id ON feedback(interview_id);
CREATE INDEX IF NOT EXISTS idx_feedback_email ON feedback(email) WHERE email IS NOT NULL;

-- ===========================================
-- 4. SESSION CLEANUP FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  UPDATE response
  SET
    active_session_id = NULL,
    session_fingerprint = NULL,
    last_heartbeat = NULL
  WHERE
    active_session_id IS NOT NULL
    AND last_heartbeat IS NOT NULL
    AND last_heartbeat < NOW() - INTERVAL '60 seconds'
    AND is_ended = false;

  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RETURN cleaned_count;
END;
$$;
