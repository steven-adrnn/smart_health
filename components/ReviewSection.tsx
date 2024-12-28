'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { Button } from './ui/button';
// import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReviewSectionProps {
  productId: string;
}

type Review = Database['public']['Tables']['reviews']['Row'] & {
  user?: { name: string }
};

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('reviews')
      .select('*, user:users(name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    setReviews(data as Review[]);
  };

  const handleSubmitReview = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast.error('Anda harus login untuk memberikan review');
      return;
    }

    if (rating === 0) {
      toast.error('Pilih rating terlebih dahulu');
      return;
    }

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: session.user.id,
        product_id: productId,
        rating,
        comment: comment || null
      });

    if (error) {
      console.error('Error submitting review:', error);
      toast.error('Gagal mengirim review');
      return;
    }

    // Update product rating
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    const avgRating = reviewsData && reviewsData.length > 0
      ? Math.round(
          reviewsData.reduce((sum, r) => sum + Number(r.rating), 0) / reviewsData.length
        )
      : rating;

    await supabase
      .from('products')
      .update({ rating: avgRating })
      .eq('id', productId);

    toast.success('Review berhasil dikirim');
    setRating(0);
    setComment('');
    fetchReviews();
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      
      {/* Review Input */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          {[1, 2, 3, 4 , 5].map((star) => (
            <Star 
              key={star}
              className={`
                w-6 h-6 cursor-pointer 
                ${star <= (hoveredRating || rating) 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-gray-300'}
              `}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
          <span className="ml-2">{rating} / 5</span>
        </div>
        
        <Textarea 
          placeholder="Tulis review Anda..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mb-4"
        />
        
        <Button onClick={handleSubmitReview}>
          Kirim Review
        </Button>
      </div>

      {/* Existing Reviews */}
      <div>
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="border-b py-4"
          >
            <div className="flex items-center mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`
                      w-4 h-4 
                      ${star <= Number(review.rating) 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-300'}
                    `}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {review.user?.name || 'Pengguna'}
              </span>
            </div>
            <p>{review.comment}</p>
            <span className="text-xs text-gray-500">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}