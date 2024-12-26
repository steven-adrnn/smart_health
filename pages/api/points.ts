// pages/api/points.ts
import { supabase } from '@/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User   ID is required.' });
        }

        const { data: points, error } = await supabase
            .from('points')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(points);
    }

    if (method === 'POST') {
        const { userId, pointsToAdd } = req.body;

        if (!userId || !pointsToAdd) {
            return res.status(400).json({ error: 'User   ID and points to add are required.' });
        }

        const { data: updatedPoints, error } = await supabase
            .from('points')
            .upsert({ user_id: userId, points: pointsToAdd })
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(updatedPoints);
    }

    return res.status(405).json({ error: 'Method not allowed.' });
}