import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// SECURITY: Fail fast if credentials are missing - don't silently use placeholders
if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = 'CRITICAL: Missing Supabase environment variables. ' +
        'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. ' +
        'See .env.example for reference.';
    console.error(errorMessage);

    // In development, throw to make the issue obvious
    if (import.meta.env.DEV) {
        throw new Error(errorMessage);
    }
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
