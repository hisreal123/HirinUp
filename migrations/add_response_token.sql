-- Migration: Add token column to response table
-- This allows us to use random string tokens instead of numeric IDs in URLs

-- Add token column (nullable for existing records)
ALTER TABLE response ADD COLUMN IF NOT EXISTS token TEXT;
CREATE INDEX IF NOT EXISTS idx_response_token ON response(token);

CREATE UNIQUE INDEX IF NOT EXISTS idx_response_token_unique ON response(token) WHERE token IS NOT NULL;

