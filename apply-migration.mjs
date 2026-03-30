import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the SQL file
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
`;

console.log('Applying migration to add house rules columns...');
console.log('SQL:', sql);

// Execute the SQL using rpc
const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('Error applying migration:', error);
  process.exit(1);
}

console.log('Migration applied successfully!');
console.log('Result:', data);
