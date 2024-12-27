import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' 
            ? {
                getItem: (key) => {
                    return window.localStorage.getItem(key);
                },
                setItem: (key, value) => {
                    window.localStorage.setItem(key, value);
                },
                removeItem: (key) => {
                    window.localStorage.removeItem(key);
                }
            }
            : undefined
    }
});