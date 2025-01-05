import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    const { table } = req.query;

    if (!table || typeof table !== 'string') {
        return res.status(400).json({ error: 'Table name is required' });
    }

    const _channel = supabase
        .channel(table)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
            console.log('Change received!', payload);
            res.json(payload);
        })
        .subscribe();

    res.status(200).json({ message: `Subscribed to ${table}` });
}