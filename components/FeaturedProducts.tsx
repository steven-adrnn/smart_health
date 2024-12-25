import { ProductCard } from './ProductCard'

export function FeaturedProducts() {
  const products = [
    { name: 'Fresh Apples', price: 2.99, image: '/placeholder.svg?height=200&width=200' },
    { name: 'Organic Carrots', price: 1.99, image: '/placeholder.svg?height=200&width=200' },
    { name: 'Free-Range Eggs', price: 3.99, image: '/placeholder.svg?height=200&width=200' },
    { name: 'Grass-Fed Beef', price: 9.99, image: '/placeholder.svg?height=200&width=200' },
  ]

  return (
    <section className="py-12 px-4 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}

