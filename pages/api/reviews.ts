// pages/api/reviews.ts
import { supabase } from '@/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Middleware CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://ii3160-production.up.railway.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    const { method } = req;

    if (method === 'GET') {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required.' });
        }

        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(reviews);
    }

    if (method === 'POST') {
        const { productId, userId, rating, comment } = req.body;

        if (!productId || !userId || !rating || !comment) {
            return res.status(400).json({ error: 'Product ID, user ID, rating, and comment are required.' });
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .insert({ product_id: productId, user_id: userId, rating, comment })
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(review);
    }

    return res.status(405).json({ error: 'Method not allowed.' });
}