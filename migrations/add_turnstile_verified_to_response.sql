-- Add turnstile_verified to response table (used by create-response API for Turnstile verification)
-- Safe to run on existing DBs: IF NOT EXISTS prevents errors if column already exists.
-- Run this in Supabase SQL Editor (or via CLI) for any project that has the response table.

ALTER TABLE response ADD COLUMN IF NOT EXISTS turnstile_verified BOOLEAN DEFAULT false NOT NULL;
