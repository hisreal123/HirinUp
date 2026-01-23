#!/bin/bash

# Migration script to add candidate table and candidate_id column to response table
# Usage: ./run-candidate-migration.sh [your-supabase-password]

PASSWORD=${1:-""}
SUPABASE_HOST="aws-1-eu-west-1.pooler.supabase.com"
SUPABASE_PORT="6543"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres.vzrpzvqzuyzxsvkgnltf"

if [ -z "$PASSWORD" ]; then
  echo "Usage: ./run-candidate-migration.sh [your-supabase-password]"
  echo ""
  echo "Or set it as an environment variable:"
  echo "  export SUPABASE_PASSWORD='your-password'"
  echo "  ./run-candidate-migration.sh"
  exit 1
fi

# Use password from environment variable if provided
PASSWORD=${SUPABASE_PASSWORD:-$PASSWORD}

echo "Running migration to add candidate table and candidate_id column..."
echo ""

psql "postgresql://${SUPABASE_USER}:${PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}" -f migrations/add_candidate_table.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo ""
  echo "Verifying migration..."
  psql "postgresql://${SUPABASE_USER}:${PASSWORD}@${SUPABASE_HOST}:${SUPABASE_PORT}/${SUPABASE_DB}" <<EOF
-- Verify the candidate table was created
SELECT table_name FROM information_schema.tables WHERE table_name = 'candidate';

-- Verify the candidate_id column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'response' AND column_name = 'candidate_id';
EOF
else
  echo ""
  echo "❌ Migration failed. Please check your password and connection."
fi

