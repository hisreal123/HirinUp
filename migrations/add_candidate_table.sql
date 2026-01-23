-- Migration: Add candidate table and candidate_id column to response table
-- This allows tracking candidate information across multiple interview responses

-- Create candidate table (if it doesn't exist)
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

-- Add candidate_id column to response table (nullable for existing records)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'response' AND column_name = 'candidate_id'
    ) THEN
        ALTER TABLE response ADD COLUMN candidate_id INTEGER REFERENCES candidate(id);
    END IF;
END $$;

-- Create index for faster lookups on candidate_id
CREATE INDEX IF NOT EXISTS idx_response_candidate_id ON response(candidate_id);

