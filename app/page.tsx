import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';

const categories = [
    { name: 'Fruits', image: '/fruits.jpg' }, // Ganti dengan path gambar yang sesuai
    { name: 'Vegetables', image: '/vegetables.jpg' },
    { name: 'Meat', image: '/meat.jpg' },
    { name: 'Dairy', image: '/dairy.jpg' },
];

const HomePage = () => {
    return (
        <div>
            <Hero />
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Kategori Produk</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => (
                        <CategoryCard key={category.name} name={category.name} image={category.image} />
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;