import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Hero() {
  return (
    <div className="bg-green-100 py-12 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Fresh from Farm to Table</h1>
        <p className="text-xl mb-8">Discover the best local, organic produce delivered to your doorstep.</p>
        <Link href="/shop">
          <Button className="bg-green-500 text-white px-6 py-3 rounded-full text-lg hover:bg-green-600 transition duration-300">
            Shop Now
          </Button>
        </Link>
      </div>
    </div>
  )
}

