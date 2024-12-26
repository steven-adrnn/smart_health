// pages/api/products.ts
import { supabase } from '@/lib/supabaseClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method === 'GET') {
        const { data: products, error } = await supabase.from('products').select('*');

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(products);
    }

    if (method === 'POST') {
        const { productId, userId } = req.body;

        if (!productId || !userId) {
            return res.status(400).json({ error: 'Product ID and user ID are required.' });
        }

        const { data: cartItem, error } = await supabase
            .from('cart')
            .insert({ product_id: productId, user_id: userId })
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(201).json(cartItem);
    }

    if (method === 'PUT') {
        const { cartItemId, quantity } = req.body;

        if (!cartItemId || !quantity) {
            return res.status(400).json({ error: 'Cart item ID and quantity are required.' });
        }

        const { data: updatedCartItem, error } = await supabase
            .from('cart')
            .update({ quantity })
            .eq('id', cartItemId)
            .select('*')
            .single();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json(updatedCartItem);
    }

    if (method === 'DELETE') {
        const { cartItemId } = req.body;

        if (!cartItemId) {
            return res.status(400).json({ error: 'Cart item ID is required.' });
        }

        const { error } = await supabase.from('cart').delete().eq('id', cartItemId);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        return res.status(204).json({});
    }
    return res.status(405).json({ error: 'Method not allowed.' }); 
}