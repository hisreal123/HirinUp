/**
 * Alternative migration script using Node.js
 * This uses the Supabase connection string from your .env file
 * 
 * Usage: node run-migration-node.js [your-password]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get password from command line argument or environment variable
const password = process.argv[2] || process.env.SUPABASE_PASSWORD;

if (!password) {
  console.error('❌ Error: Password required');
  console.log('\nUsage:');
  console.log('  node run-migration-node.js [your-supabase-password]');
  console.log('\nOr set environment variable:');
  console.log('  export SUPABASE_PASSWORD="your-password"');
  console.log('  node run-migration-node.js');
  process.exit(1);
}

const connectionString = `postgresql://postgres.vzrpzvqzuyzxsvkgnltf:${password}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;
const migrationFile = path.join(__dirname, 'migrations', 'add_response_token.sql');

console.log('🔄 Running migration...\n');

try {
  // Read the migration file
  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  
  // Add verification query
  const fullSQL = migrationSQL + `
-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'response' AND column_name = 'token';
`;

  // Execute via psql
  const result = execSync(`psql "${connectionString}" -c "${fullSQL.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8',
    stdio: 'inherit'
  });

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}

