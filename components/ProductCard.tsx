import { Button } from '@/components/ui/button'
import { Product, formatPrice } from '@/lib/products'
import { Star } from 'lucide-react'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  if (!product) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link href={`/product/${product.id}`}>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-green-600">{product.name}</h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2">{product.farm}</p>
        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
        <div className="flex items-center mb-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="ml-1 text-sm text-gray-600">{product.rating} ({product.reviews.length} reviews)</span>
        </div>
        <p className="text-lg font-bold mb-4">{formatPrice(product.price)}</p>
        <Button className="w-full bg-green-500 text-white hover:bg-green-600 transition duration-300">
          Add to Cart
        </Button>
      </div>
    </div>
  )
}

