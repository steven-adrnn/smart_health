import { ProductList } from '@/components/ProductList'
import { getProductsByCategory } from '@/lib/products'

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const products = getProductsByCategory(params.slug)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{params.slug}</h1>
      {products.length > 0 ? (
        <ProductList products={products} />
      ) : (
        <p>No products found in this category.</p>
      )}
    </div>
  )
}

