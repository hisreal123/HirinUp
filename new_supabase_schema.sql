
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; 


CREATE TYPE plan AS ENUM ('free', 'pro', 'free_trial_over');

CREATE TABLE organization (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT,
    allowed_responses_count INTEGER DEFAULT 0 NOT NULL,
    plan plan DEFAULT 'free' NOT NULL
);

CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    email TEXT NOT NULL,
    organization_id TEXT REFERENCES organization(id) ON DELETE CASCADE,
    CONSTRAINT user_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_user_organization_id ON "user"(organization_id);
CREATE INDEX idx_user_email ON "user"(email);

CREATE TABLE interviewer (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    agent_id TEXT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    audio TEXT,
    empathy INTEGER NOT NULL CHECK (empathy >= 0 AND empathy <= 100),
    exploration INTEGER NOT NULL CHECK (exploration >= 0 AND exploration <= 100),
    rapport INTEGER NOT NULL CHECK (rapport >= 0 AND rapport <= 100),
    speed INTEGER NOT NULL CHECK (speed >= 0 AND speed <= 100)
);

CREATE TABLE interview (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    objective TEXT,
    organization_id TEXT REFERENCES organization(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
    interviewer_id INTEGER REFERENCES interviewer(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    logo_url TEXT,
    url TEXT,
    readable_slug TEXT UNIQUE,
    questions JSONB DEFAULT '[]'::jsonb,
    quotes JSONB[] DEFAULT ARRAY[]::JSONB[],
    insights TEXT[] DEFAULT ARRAY[]::TEXT[],
    respondents TEXT[] DEFAULT ARRAY[]::TEXT[],
    question_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    time_duration TEXT
);

-- Add indexes for faster interview lookups
CREATE INDEX idx_interview_organization_id ON interview(organization_id);
CREATE INDEX idx_interview_user_id ON interview(user_id);
CREATE INDEX idx_interview_is_active ON interview(is_active) WHERE is_active = true;
CREATE INDEX idx_interview_readable_slug ON interview(readable_slug);

-- Candidate table (must be created before response since response references it)
CREATE TABLE candidate (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    email TEXT,
    name TEXT,
    full_name TEXT,
    phone TEXT,
    gender TEXT,
    country TEXT,
    portfolio_website TEXT,
    social_media_links JSONB DEFAULT '{}'::jsonb,
    work_experience JSONB DEFAULT '[]'::jsonb,
    CONSTRAINT candidate_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add unique constraint on candidate email (optional - uncomment if needed)
-- CREATE UNIQUE INDEX idx_candidate_email_unique ON candidate(email) WHERE email IS NOT NULL;

-- Add index for faster candidate lookups by email
CREATE INDEX idx_candidate_email ON candidate(email) WHERE email IS NOT NULL;

CREATE TABLE response (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    interview_id TEXT NOT NULL REFERENCES interview(id) ON DELETE CASCADE,
    candidate_id INTEGER REFERENCES candidate(id) ON DELETE SET NULL,
    token TEXT UNIQUE NOT NULL, -- Random string token for URLs (e.g., nanoid)
    name TEXT,
    email TEXT,
    call_id TEXT,
    candidate_status TEXT,
    duration INTEGER CHECK (duration >= 0),
    details JSONB DEFAULT '{}'::jsonb,
    analytics JSONB DEFAULT '{}'::jsonb,
    is_analysed BOOLEAN DEFAULT false NOT NULL,
    is_ended BOOLEAN DEFAULT false NOT NULL,
    is_viewed BOOLEAN DEFAULT false NOT NULL,
    tab_switch_count INTEGER DEFAULT 0,
    call_flow_state JSONB DEFAULT '{}'::jsonb,
    active_session_id TEXT,
    session_fingerprint TEXT,
    last_heartbeat TIMESTAMPTZ,
    CONSTRAINT response_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE UNIQUE INDEX idx_response_interview_email_unique ON response(interview_id, email)
WHERE email IS NOT NULL AND is_ended = false;

CREATE INDEX idx_response_token ON response(token);
CREATE INDEX idx_response_interview_id ON response(interview_id);
CREATE INDEX idx_response_candidate_id ON response(candidate_id) WHERE candidate_id IS NOT NULL;
CREATE INDEX idx_response_call_id ON response(call_id) WHERE call_id IS NOT NULL;
CREATE INDEX idx_response_is_ended ON response(is_ended) WHERE is_ended = false;
CREATE INDEX idx_response_email ON response(email) WHERE email IS NOT NULL;
CREATE INDEX idx_response_active_session ON response(active_session_id) WHERE active_session_id IS NOT NULL;
CREATE INDEX idx_response_last_heartbeat ON response(last_heartbeat) WHERE last_heartbeat IS NOT NULL;

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    interview_id TEXT NOT NULL REFERENCES interview(id) ON DELETE CASCADE,
    email TEXT,
    feedback TEXT,
    satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
    CONSTRAINT feedback_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);


CREATE INDEX idx_feedback_interview_id ON feedback(interview_id);
CREATE INDEX idx_feedback_email ON feedback(email) WHERE email IS NOT NULL;

-- Auto-cleanup stale sessions (clears sessions with no heartbeat in 60 seconds)
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

COMMENT ON TABLE response IS 'Stores individual interview responses. Each response is linked to a unique token for URL-based access.';
COMMENT ON COLUMN response.token IS 'Unique token for anonymous/semi-anonymous access via URL. Generated using nanoid or similar.';
COMMENT ON INDEX idx_response_interview_email_unique IS 'Prevents duplicate responses from the same email for the same interview (only for active responses).';
COMMENT ON COLUMN response.active_session_id IS 'Unique session ID for the currently active tab/device. NULL means no active session.';
COMMENT ON COLUMN response.session_fingerprint IS 'Browser fingerprint hash for device identification.';
COMMENT ON COLUMN response.last_heartbeat IS 'Timestamp of the last heartbeat from the active session. Used to detect stale sessions.';

