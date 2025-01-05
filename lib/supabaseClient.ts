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
            : undefined,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// Fungsi untuk login dengan Google
export const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`
        }
    });
};

// Fungsi untuk mendapatkan sesi pengguna
export const getUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

// Fungsi untuk menambah poin
export const addUserPoints = async (userId: string, points: number) => {
    const { data, error } = await supabase
        .from('points')
        .upsert({ 
            user_id: userId, 
            points 
        })
        .select();

    if (error) {
        console.error('Error adding points:', error);
        return null;
    }

    return data;
};