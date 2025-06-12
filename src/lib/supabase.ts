// Import the createClient function from Supabase
import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL from your environment variables
// This is the URL you copied from your Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Get the Supabase anonymous key from your environment variables
// This is the anon/public key you copied from your Supabase project settings
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have both required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create and export the Supabase client
// This client will be used throughout your app to interact with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 