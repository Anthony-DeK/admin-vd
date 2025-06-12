// Import the createClient function from Supabase
import { createClient } from '@supabase/supabase-js';

// Get environment variables using import.meta.env (Vite's way)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug information (only in development)
if (import.meta.env.DEV) {
  console.log('Environment variables check:');
  console.log('- VITE_SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
  console.log('- VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'present' : 'missing');
}

// Check if we have both required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your environment configuration.');
}

// Create and export the Supabase client
// This client will be used throughout your app to interact with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
}); 