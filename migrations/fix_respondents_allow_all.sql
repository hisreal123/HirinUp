-- Allow all candidates to respond when interview has no restricted list
-- Fixes "You have already responded or you are not eligible" when respondents was empty array.
-- Run in Supabase SQL Editor (for existing projects). New projects use new_supabase_schema.sql which defaults respondents to NULL.

-- 1. Set empty respondent list to NULL so app treats as "no restriction"
UPDATE interview
SET respondents = NULL
WHERE respondents = '{}';

-- 2. (Optional) Change default for future INSERTs so new interviews allow everyone
ALTER TABLE interview ALTER COLUMN respondents SET DEFAULT NULL;
