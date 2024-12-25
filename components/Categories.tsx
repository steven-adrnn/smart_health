import Link from 'next/link'

export function Categories() {
  const categories = [
    { name: 'Fruits', image: '/placeholder.svg?height=100&width=100', slug: 'fruits' },
    { name: 'Vegetables', image: '/placeholder.svg?height=100&width=100', slug: 'vegetables' },
    { name: 'Meat', image: '/placeholder.svg?height=100&width=100', slug: 'meat' },
    { name: 'Dairy', image: '/placeholder.svg?height=100&width=100', slug: 'dairy' },
  ]

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link href={`/category/${category.slug}`} key={index} className="block">
              <div className="bg-white rounded-lg shadow-md p-4 text-center cursor-pointer hover:shadow-lg transition duration-300">
                <img src={category.image} alt={category.name} className="w-24 h-24 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

