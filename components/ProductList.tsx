import ProductCard from './ProductCard';
import { Database } from '@/lib/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  if (!products || products.length === 0) {
    return <p>Tidak ada produk yang tersedia.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}