// pages/api/addresses.ts
import { supabase } from '@/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User  ID is required.' });
        }

        const { data: addresses, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(addresses);
    }

    if (method === 'POST') {
        const { userId, address } = req.body;

        if (!userId || !address) {
            return res.status(400).json({ error: 'User  ID and address are required.' });
        }

        const { data: newAddress, error } = await supabase
            .from('addresses')
            .insert({ user_id: userId, address })
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(newAddress);
    }

    return res.status(405).json({ error: 'Method not allowed.' });
}