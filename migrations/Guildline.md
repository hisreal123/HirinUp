

## New Project

1. Open your project: [Supabase Dashboard](https://supabase.com/dashboard) → **Your project**.
2. Go to **SQL Editor**.
3. Run the migrations in this order (copy-paste each file’s contents and click **Run**):

**Step 1 — Database Schema:** Run the contents of **`new_supabase_schema.sql`**.

**Step 2 — Turnstile column:** Run the contents of **`add_turnstile_verified_to_response.sql`**.
- Adds `turnstile_verified` to `response` if missing.
- Safe to run more than once.

**Step 3 — RLS (optional):** If you use Row Level Security, run **`rls_policies.sql`** after the schema migrations. It now includes anon policies (interview, organization, user, interviewer, response, feedback).

---

## Fixes (run in SQL Editor if you hit these issues)

**1 — "You have already responded or you are not eligible"** (candidates blocked after entering details)

Run the migration **`fix_respondents_allow_all.sql`**, or in SQL Editor:

```sql
UPDATE interview SET respondents = NULL WHERE respondents = '{}';
ALTER TABLE interview ALTER COLUMN respondents SET DEFAULT NULL;
```

**2 — Feedback form does not submit** (candidate feedback fails)

Run the migration **`allow_anon_feedback_insert.sql`**, or in SQL Editor:

```sql
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "feedback_insert_anon" ON feedback;
CREATE POLICY "feedback_insert_anon"
ON feedback FOR INSERT TO anon WITH CHECK (true);
```


---

## After schema — double-check Supabase keys

The app needs **three** Supabase values from the **same** project you ran the schema on:

| Env variable | Where it’s used | Where to get it |
|--------------|----------------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase access | Supabase Dashboard → **Project Settings** → **API** → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (e.g. session, some services) | Same page → **Project API keys** → `anon` **public** |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes (get-response, register-call, create-response, etc.) | Same page → **Project API keys** → `service_role` **secret** |

**Checklist:**

1. All three are set in `.env` (and in your host’s env vars if deployed).
2. They are from the **same** Supabase project (the one you just ran the schema on).
3. **Anon key** = the public “anon” key (starts with `eyJ...`); **service role** = the secret “service_role” key — never expose the service role in the browser or in `NEXT_PUBLIC_*`.
4. If you use RLS, the anon key is subject to RLS; the service role bypasses RLS (API routes use it so they can read/write by token).

If the anon key is wrong or from another project, session/claim and client-side Supabase calls can fail. If the service role key is wrong or missing, API routes (e.g. get-response, register-call) will fail.



