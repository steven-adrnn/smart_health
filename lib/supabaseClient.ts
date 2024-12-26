// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// PASTIKAN ENVIRONMENT VARIABLES BENAR
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Tambahkan logging untuk debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Key exists' : 'Key is missing');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    // Tambahkan opsi debugging
    db: {
        schema: 'public',
    },
    auth: {
        persistSession: true,
    },
});