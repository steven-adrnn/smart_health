import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Categories } from '@/components/Categories'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { Footer } from '@/components/Footer'
import { PersonalizedRecipes } from '@/components/PersonalizedRecipes'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Categories />
        <FeaturedProducts />
        <PersonalizedRecipes />
      </main>
      <Footer />
    </div>
  )
}

