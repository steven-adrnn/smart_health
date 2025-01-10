// pages/api/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    // Validasi metode HTTP
    if (method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Ambil user ID dari query
        const userId = req.query.userId as string;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch data komprehensif
        const [
            { data: userData },
            { data: savedRecipes },
            { data: forumPosts },
            { data: pointsData }
        ] = await Promise.all([
            supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single(),
            supabase
                .from('recipes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            supabase
                .from('forum_posts')
                .select(`
                    *,
                    likes_count:forum_likes(count),
                    comments_count:forum_comments(count)
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false }),
            supabase
                .from('points')
                .select('points')
                .eq('user_id', userId)
                .single()
        ]);

        // Hitung statistik
        const stats = {
            totalRecipes: savedRecipes?.length || 0,
            totalPosts: forumPosts?.length || 0,
            totalPoints: pointsData?.points || 0
        };

        return res.status(200).json({
            user: userData,
            recipes: savedRecipes,
            forumPosts,
            stats
        });

    } catch (error) {
        console.error('Profile Fetch Error:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
}