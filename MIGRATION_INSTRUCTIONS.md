# Migration Instructions: Add Token Column to Response Table

## Problem
The error `"Could not find the 'token' column of 'response' in the schema cache"` means the database doesn't have the `token` column yet.

## Solution: Run Migration in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration SQL
Copy and paste this SQL into the SQL Editor and click **Run**:

```sql
-- Add token column (nullable for existing records)
ALTER TABLE response ADD COLUMN IF NOT EXISTS token TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_response_token ON response(token);

-- Make token unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_response_token_unique ON response(token) WHERE token IS NOT NULL;
```

### Step 3: Verify the Column Was Added
Run this query to verify:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'response' AND column_name = 'token';
```

You should see a row with `token` and `text`.

### Step 4: Refresh Supabase Schema Cache
After adding the column, you may need to refresh the schema cache:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Scroll down and click **"Reload schema"** or **"Refresh"** (if available)
3. Alternatively, restart your Next.js dev server - it should pick up the new column

### Step 5: Test
1. Restart your Next.js dev server: `yarn dev`
2. Try generating a new interview link
3. The link should now work with the random token format

## Optional: Backfill Existing Records
If you have existing response records without tokens, you can backfill them:

```sql
-- Generate tokens for existing records (optional)
UPDATE response 
SET token = gen_random_uuid()::text 
WHERE token IS NULL;
```

**Note:** Only run this if you want to add tokens to existing responses. New responses will automatically get tokens.

