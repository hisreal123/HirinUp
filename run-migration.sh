#!/bin/bash

# Migration script to add token column to response table
# Usage: ./run-migration.sh [your-supabase-password]

PASSWORD=${1:-""}
SUPABASE_HOST="aws-1-eu-west-1.pooler.supabase.com"
SUPABASE_PORT="6543"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres.vzrpzvqzuyzxsvkgnltf"

if [ -z "$PASSWORD" ]; then
  echo "Usage: ./run-migration.sh [your-supabase-password]"
  echo ""
  echo "Or set it as an environment variable:"
  echo "  export SUPABASE_PASSWORD='your-password'"
  echo "  ./run-migration.sh"
  exit 1
fi

# Use password from environment variable if provided
PASSWORD=${SUPABASE_PASSWORD:-$PASSWORD}

echo "Running migration to add token column..."
echo ""

psql "postgresql://${SUPABASE_USER}:${PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}" <<EOF
-- Add token column (nullable for existing records)
ALTER TABLE response ADD COLUMN IF NOT EXISTS token TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_response_token ON response(token);

-- Make token unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_response_token_unique ON response(token) WHERE token IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'response' AND column_name = 'token';
EOF

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
else
  echo ""
  echo "❌ Migration failed. Please check your password and connection."
fi

