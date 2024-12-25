import { ProductList } from '@/components/ProductList'
import { getAllProducts } from '@/lib/products'

export default function ShopPage() {
  const products = getAllProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      {products.length > 0 ? (
        <ProductList products={products} />
      ) : (
        <p>No products available at the moment.</p>
      )}
    </div>
  )
}

