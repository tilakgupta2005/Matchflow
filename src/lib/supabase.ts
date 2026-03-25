import { createClient } from '@supabase/supabase-js';

// Use placeholder strings if variables are missing so the whole React app doesn't crash on boot (white screen)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('Missing Supabase environment variables! Please create a .env.local file with your Supabase URL and Anon Key.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
