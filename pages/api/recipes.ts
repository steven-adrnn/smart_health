// pages/api/recipes.ts
import { supabase } from '@/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User   ID is required.' });
        }

        // Ambil produk yang paling banyak dibeli oleh pengguna
        const { data: cartItems, error: cartError } = await supabase
            .from('cart')
            .select('product_id, quantity')
            .eq('user_id', userId)
            .order('quantity', { ascending: false })
            .limit(5);

        if (cartError) {
            return res.status(500).json({ error: cartError.message });
        }

        // Ambil resep yang menggunakan produk tersebut
        const productIds = cartItems.map((item) => item.product_id);
        const { data: recipes, error: recipeError } = await supabase
            .from('recipes')
            .select('*')
            .or(`ingredients.product_id.in.${productIds.join(',')}`);

        if (recipeError) {
            return res.status(500).json({ error: recipeError.message });
        }

        return res.status(200).json(recipes);
    }

    return res.status(405).json({ error: 'Method not allowed.' });
}