-- Ensure anon can insert into feedback (candidate feedback form)
-- Run in Supabase SQL Editor if feedback submit fails with permission denied

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feedback_insert_anon" ON feedback;
CREATE POLICY "feedback_insert_anon"
ON feedback FOR INSERT
TO anon
WITH CHECK (true);
