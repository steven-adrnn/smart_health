'use client'

import { useState, useEffect } from 'react';
import { Database } from '@/lib/database.types';
import { Button } from './ui/button';
// import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Star } from 'lucide-react';

interface ReviewSectionProps {
  productId: string;
  userId: string;
}

type Review = Database['public']['Tables']['reviews']['Row'] & {
  user?: { name: string }
};

export function ReviewSection({ productId, userId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/review?productId=${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId, rating, comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const newReview = await response.json();
      setReviews((prevReviews) => [newReview, ...prevReviews]);
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsLoading(false);
    }
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
        
        <Button onClick={handleSubmitReview} disabled={isLoading}>
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