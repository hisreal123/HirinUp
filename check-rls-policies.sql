-- Check if RLS is enabled on the response table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'response';

-- Check existing RLS policies on response table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'response';

-- If RLS is blocking inserts, you may need to:
-- 1. Disable RLS (not recommended for production):
--    ALTER TABLE response DISABLE ROW LEVEL SECURITY;

-- 2. Or create a policy that allows inserts (recommended):
--    CREATE POLICY "Allow public inserts to response" 
--    ON response FOR INSERT 
--    TO anon, authenticated 
--    WITH CHECK (true);

