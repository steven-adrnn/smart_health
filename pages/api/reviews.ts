import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Fetch reviews for a specific product
      try {
        const { productId } = req.query;
        if (!productId) {
          return res.status(400).json({ error: 'Product ID is required' });
        }

        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return res.status(200).json(data);
      } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'An unknown error occurred' });
      }

    case 'POST':
      // Submit a new review
      try {
        const { productId, userId, rating, comment } = req.body;

        if (!productId || !userId || !rating || !comment) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Insert review
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .insert([{ product_id: productId, user_id: userId, rating, comment }])
          .single();

        if (reviewError) {
          throw reviewError;
        }

        // Update product rating
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('rating, total_reviews')
          .eq('id', productId)
          .single();

        if (productError) {
          throw productError;
        }

        const newTotalReviews = productData.total_reviews + 1;
        const newRating =
          (productData.rating * productData.total_reviews + rating) / newTotalReviews;

        const { error: updateError } = await supabase
          .from('products')
          .update({ rating: newRating, total_reviews: newTotalReviews })
          .eq('id', productId);

        if (updateError) {
          throw updateError;
        }

        return res.status(201).json(reviewData);
      } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'An unknown error occurred' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}