import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Definisikan tipe untuk payload
type RealtimePayload = {
    eventType: string;
    schema: string;
    table: string;
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  };

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
            eventsPerSecond: 10,
        },
    },
    db: {
        schema: 'public', // Pastikan schema benar
    }
    
});


// Fungsi Utility Realtime dengan Error Handling
export const createRealtimeChannel = (
    tableName: string, 
    callback: (payload: RealtimePayload) => void
) => {
    const channel = supabase
        .channel(tableName)
        .on(
            'postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: tableName 
            }, 
            callback
        )
        .subscribe((status) => {
            console.log(`Realtime Channel (${tableName}) Status:`, status);
        });

    return channel;
};

// Fungsi Reconnect Global
export const setupRealtimeReconnect = () => {
    if (typeof window !== 'undefined') {
        window.addEventListener('online', () => {
            console.log('Network back online, reconnecting Supabase channels');
            supabase.removeAllChannels();
        });

        window.addEventListener('offline', () => {
            console.log('Network offline, cleaning Supabase channels');
            supabase.removeAllChannels();
        });
    }
};

// Fungsi Monitoring Koneksi
export const monitorRealtimeConnection = () => {
    const wsUrl = `wss://${new URL(supabaseUrl).hostname}/realtime/v1/websocket`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
        console.log('WebSocket connection established');
    };
    
    socket.onerror = (error) => {
        console.error('WebSocket Connection Error:', error);
    };
    
    socket.onclose = (event) => {
        console.warn('WebSocket Connection Closed:', event);
    };
};

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