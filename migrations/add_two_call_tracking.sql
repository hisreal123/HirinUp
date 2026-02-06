-- Add call flow state tracking to response table
-- Single JSONB column to track the two-call POC flow
-- Flexible: no migrations needed when flow changes

ALTER TABLE response ADD COLUMN IF NOT EXISTS call_flow_state JSONB DEFAULT '{}';
