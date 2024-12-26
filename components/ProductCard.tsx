// import { Button } from '@/components/ui/button'
// import { Product, formatPrice } from '@/lib/products'
// import { Star } from 'lucide-react'
// import Link from 'next/link'

// interface ProductCardProps {
//   product: Product
// }

// export function ProductCard({ product }: ProductCardProps) {
//   if (!product) {
//     return null;
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       <Link href={`/product/${product.id}`}>
//         <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
//       </Link>
//       <div className="p-4">
//         <Link href={`/product/${product.id}`}>
//           <h3 className="text-lg font-semibold mb-2 hover:text-green-600">{product.name}</h3>
//         </Link>
//         <p className="text-sm text-gray-600 mb-2">{product.farm}</p>
//         <p className="text-sm text-gray-600 mb-2">{product.description}</p>
//         <div className="flex items-center mb-2">
//           <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
//           <span className="ml-1 text-sm text-gray-600">{product.rating} ({product.reviews.length} reviews)</span>
//         </div>
//         <p className="text-lg font-bold mb-4">{formatPrice(product.price)}</p>
//         <Button className="w-full bg-green-500 text-white hover:bg-green-600 transition duration-300">
//           Add to Cart
//         </Button>
//       </div>
//     </div>
//   )
// }




// components/ProductCard.tsx
// import { useState, useEffect } from 'react';
// import { supabase } from '@/lib/supabaseClient';

// const ProductCard = ({ product }) => {
//     const [reviews, setReviews] = useState([]);
//     const [rating, setRating] = useState(0);
//     const [comment, setComment] = useState('');

//     useEffect(() => {
//         const fetchReviews = async () => {
//             const { data, error } = await supabase
//                 .from('reviews')
//                 .select('*')
//                 .eq('product_id', product.id);
//             if (data) setReviews(data);
//         };

//         fetchReviews();
//     }, [product.id]);

//     const handleReviewSubmit = async (e) => {
//         e.preventDefault();
//         const { user } = supabase.auth.session();
//         if (!user) return alert('You must be logged in to submit a review.');

//         const { error } = await supabase
//             .from('reviews')
//             .insert({ product_id: product.id, user_id: user.id, rating, comment });

//         if (error) {
//             alert('Error submitting review: ' + error.message);
//         } else {
//             setComment('');
//             setRating(0);
//             // Refresh reviews
//             const { data } = await supabase
//                 .from('reviews')
//                 .select('*')
//                 .eq('product_id', product.id);
//             setReviews(data);
//         }
//     };

//     return (
//         <div>
//             <h2>{product.name}</h2>
//             <p>{product.description}</p>
//             <p>${product.price}</p>
//             <button onClick={() => addToCart(product.id)}>Add to Cart</button>

//             <h3>Reviews</h3>
//             {reviews.map((review) => (
//                 <div key={review.id}>
//                     <p>{review.comment} - {review.rating} stars</p>
//                 </div>
//             ))}

//             <form onSubmit={handleReviewSubmit}>
//                 <input
//                     type="number"
//                     value={rating}
//                     onChange={(e) => setRating(Number(e.target.value))}
//                     min="1"
//                     max="5"
//                     placeholder="Rating (1-5)"
//                     required
//                 />
//                 <textarea
//                     value={comment}
//                     onChange={(e) => setComment(e.target.value)}
//                     placeholder="Leave a comment"
//                     required
//                 />
//                 <button type="submit">Submit Review</button>
//             </form>
//         </div>
//     );
// };

// export default ProductCard;



import { Database } from '@/lib/database.types';

interface ProductCardProps {
    product: Database['public']['Tables']['products']['Row'];
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    return (
        <div>
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
        </div>
    );
};

export default ProductCard;