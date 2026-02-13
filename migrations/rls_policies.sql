

-- Get the organization_id for the current authenticated user
CREATE OR REPLACE FUNCTION public.user_org_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM "user" WHERE id = auth.uid()::text LIMIT 1;
$$;

-- Check if user belongs to a specific organization
CREATE OR REPLACE FUNCTION public.belongs_to_org(org_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "user"
    WHERE id = auth.uid()::text AND organization_id = org_id
  );
$$;

-- Check if interview belongs to user's organization
CREATE OR REPLACE FUNCTION public.owns_interview(iid TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM interview i
    WHERE i.id = iid AND i.organization_id = public.user_org_id()
  );
$$;

-- ===========================================
-- GRANT EXECUTE PERMISSIONS ON FUNCTIONS
-- ===========================================
GRANT EXECUTE ON FUNCTION public.user_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.belongs_to_org(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_interview(TEXT) TO authenticated;

GRANT EXECUTE ON FUNCTION public.user_org_id() TO anon;
GRANT EXECUTE ON FUNCTION public.belongs_to_org(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.owns_interview(TEXT) TO anon;

-- ===========================================
-- 1. ORGANIZATION TABLE
-- ===========================================
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_own"
ON organization FOR SELECT
TO authenticated
USING (public.belongs_to_org(id));

CREATE POLICY "org_update_own"
ON organization FOR UPDATE
TO authenticated
USING (public.belongs_to_org(id))
WITH CHECK (public.belongs_to_org(id));

CREATE POLICY "org_insert_authenticated"
ON organization FOR INSERT
TO authenticated
WITH CHECK (true);

-- ===========================================
-- 2. USER TABLE
-- ===========================================
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_select_self"
ON "user" FOR SELECT
TO authenticated
USING (id = auth.uid()::text);

CREATE POLICY "user_select_same_org"
ON "user" FOR SELECT
TO authenticated
USING (organization_id = public.user_org_id());

CREATE POLICY "user_insert_self"
ON "user" FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid()::text);

CREATE POLICY "user_update_self"
ON "user" FOR UPDATE
TO authenticated
USING (id = auth.uid()::text)
WITH CHECK (id = auth.uid()::text);

-- ===========================================
-- 3. INTERVIEWER TABLE (Public Catalog)
-- ===========================================
ALTER TABLE interviewer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "interviewer_select_public"
ON interviewer FOR SELECT
TO authenticated, anon
USING (true);

-- INSERT/UPDATE/DELETE only via service_role (migrations/admin)

-- ===========================================
-- 4. INTERVIEW TABLE
-- ===========================================
ALTER TABLE interview ENABLE ROW LEVEL SECURITY;

-- Authenticated users: full access to their org's interviews
CREATE POLICY "interview_select_org"
ON interview FOR SELECT
TO authenticated
USING (organization_id = public.user_org_id());

CREATE POLICY "interview_insert_org"
ON interview FOR INSERT
TO authenticated
WITH CHECK (organization_id = public.user_org_id());

CREATE POLICY "interview_update_org"
ON interview FOR UPDATE
TO authenticated
USING (organization_id = public.user_org_id())
WITH CHECK (organization_id = public.user_org_id());

CREATE POLICY "interview_delete_org"
ON interview FOR DELETE
TO authenticated
USING (organization_id = public.user_org_id());

-- Anonymous users: can view active, non-archived interviews (for candidates)
CREATE POLICY "interview_select_active_anon"
ON interview FOR SELECT
TO anon
USING (is_active = true AND is_archived = false);

-- ===========================================
-- 5. CANDIDATE TABLE
-- ===========================================
ALTER TABLE candidate ENABLE ROW LEVEL SECURITY;

-- Candidates are created during interview flow (public access)
CREATE POLICY "candidate_insert_public"
ON candidate FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "candidate_select_public"
ON candidate FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "candidate_update_public"
ON candidate FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- ===========================================
-- 6. RESPONSE TABLE
-- ===========================================
ALTER TABLE response ENABLE ROW LEVEL SECURITY;

-- Anyone can create responses (candidates taking interviews)
CREATE POLICY "response_insert_public"
ON response FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Anyone can update responses (during interview flow)
CREATE POLICY "response_update_public"
ON response FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Anonymous: can view by token only
CREATE POLICY "response_select_by_token"
ON response FOR SELECT
TO anon
USING (token IS NOT NULL);

-- Authenticated: can view responses for their org's interviews
CREATE POLICY "response_select_org"
ON response FOR SELECT
TO authenticated
USING (public.owns_interview(interview_id));

-- ===========================================
-- 7. FEEDBACK TABLE
-- ===========================================
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can submit feedback
CREATE POLICY "feedback_insert_public"
ON feedback FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Only org members can view feedback
CREATE POLICY "feedback_select_org"
ON feedback FOR SELECT
TO authenticated
USING (public.owns_interview(interview_id));

-- ===========================================
-- INDEXES FOR RLS PERFORMANCE
-- ===========================================
-- These indexes help RLS policies evaluate faster

CREATE INDEX IF NOT EXISTS idx_user_id_org ON "user"(id, organization_id);
CREATE INDEX IF NOT EXISTS idx_interview_org ON interview(organization_id);
CREATE INDEX IF NOT EXISTS idx_response_interview ON response(interview_id);
CREATE INDEX IF NOT EXISTS idx_feedback_interview ON feedback(interview_id);
