// Import the createClient function from Supabase
import { createClient } from '@supabase/supabase-js';

// Get environment variables using import.meta.env (Vite's way)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug information
console.log('Environment variables check:');
console.log('- VITE_SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'present' : 'missing');
console.log('- All env variables:', Object.keys(import.meta.env));

// Check if we have both required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:', {
    url: supabaseUrl,
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create and export the Supabase client
// This client will be used throughout your app to interact with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 