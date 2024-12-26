import Header from '@/components/Header';
import { Hero } from '@/components/Hero';
import Categories from '@/components/Categories';
import { Footer } from '@/components/Footer';

const categories = [
  { name: 'Fruits', image: '/placeholder.svg?height=100&width=100', slug: 'fruits' },
  { name: 'Vegetables', image: '/placeholder.svg?height=100&width=100', slug: 'vegetables' },
  { name: 'Meat', image: '/placeholder.svg?height=100&width=100', slug: 'meat' },
  { name: 'Dairy', image: '/placeholder.svg?height=100&width=100', slug: 'dairy' },
];

const HomePage = () => {
  return (
    <div>
      <Header />
      <Hero />
      <Categories categories={categories} />
      <Footer />
    </div>
  );
};

export default HomePage;