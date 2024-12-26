import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    const { method } = req;

    switch (method) {
        case 'POST':
            try {
                const { email, password } = req.body;

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) {
                    return res.status(400).json({ error: error.message });
                }

                return res.status(200).json({ 
                    userId: data.user?.id,
                    email: data.user?.email 
                });
            } catch (error) {
                return res.status(500).json({ error: 'Server error' });
            }

        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}