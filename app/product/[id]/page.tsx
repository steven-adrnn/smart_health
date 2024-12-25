'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { getProductById, formatPrice } from '@/lib/products'
import { BackButton } from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'

export default function ProductPage() {
  const { id } = useParams()
  const product = getProductById(Number(id))
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  if (!product) {
    return <div>Product not found</div>
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log('Review submitted:', { rating: reviewRating, comment: reviewComment })
    // Reset form
    setReviewRating(5)
    setReviewComment('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      <div className="grid md:grid-cols-2 gap-8">
        <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-xl font-semibold mb-2">{formatPrice(product.price)}</p>
          <p className="mb-4">{product.description}</p>
          <p className="mb-4">Farm: {product.farm}</p>
          <div className="flex items-center mb-4">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="ml-1">{product.rating} ({product.reviews.length} reviews)</span>
          </div>
          <Button className="w-full mb-4">Add to Cart</Button>
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          {product.reviews.map((review) => (
            <div key={review.id} className="mb-4 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1">{review.rating}</span>
              </div>
              <p>{review.comment}</p>
              <p className="text-sm text-gray-600 mt-2">By {review.userName} on {review.date}</p>
            </div>
          ))}
          <form onSubmit={handleReviewSubmit} className="mt-8">
            <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
            <div className="mb-4">
              <label htmlFor="rating" className="block mb-2">Rating</label>
              <Input
                type="number"
                id="rating"
                min="1"
                max="5"
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block mb-2">Comment</label>
              <Textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Submit Review</Button>
          </form>
        </div>
      </div>
    </div>
  )
}

