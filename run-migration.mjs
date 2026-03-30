import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL in .env file');
  process.exit(1);
}

// Extract project ref from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference from Supabase URL');
  process.exit(1);
}

console.log('📦 Supabase Project:', projectRef);
console.log('');
console.log('⚠️  To apply this migration, you need the database password.');
console.log('');
console.log('Please follow these steps:');
console.log('');
console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/settings/database');
console.log('2. Find the "Connection string" section');
console.log('3. Copy the "Connection string" (it starts with postgresql://postgres:)');
console.log('4. Replace [YOUR-PASSWORD] with your actual database password');
console.log('5. Add this to your .env file:');
console.log('');
console.log('   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.' + projectRef + '.supabase.co:5432/postgres"');
console.log('');
console.log('6. Run this script again: node run-migration.mjs');
console.log('');

// Check if DATABASE_URL is set
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('ℹ️  DATABASE_URL not found in .env file.');
  process.exit(0);
}

// Connect and run migration
console.log('🔌 Connecting to database...');

const client = new pg.Client({
  connectionString: dbUrl,
});

try {
  await client.connect();
  console.log('✅ Connected successfully!');
  console.log('');

  const sql = `
ALTER TABLE apartment_details
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS parties_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS smoking_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photoshoots_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_hours_start TIME,
ADD COLUMN IF NOT EXISTS quiet_hours_end TIME,
ADD COLUMN IF NOT EXISTS check_in_time TIME,
ADD COLUMN IF NOT EXISTS check_out_time TIME,
ADD COLUMN IF NOT EXISTS custom_house_rules TEXT;
  `.trim();

  console.log('🚀 Running migration...');
  console.log('');
  console.log(sql);
  console.log('');

  await client.query(sql);

  console.log('✅ Migration applied successfully!');
  console.log('');
  console.log('You can now save house rules in your app!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
