import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';

const categories = [
    { name: 'Fruits', image: '/image/fruits.jpg' }, // Ganti dengan path gambar yang sesuai
    { name: 'Vegetables', image: '/image/vegetables.jpg' },
    { name: 'Meat', image: '/image/meat.jpg' },
    { name: 'Dairy', image: '/image/dairy.jpg' },
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

            <script>
                window.MUSICMATE_API_KEY = 'mk_tjZrWLCT04UdNkJYhtcoe7stV0kClKqNB6dLSnzQcRg';
            </script>
            <script src="https://spotify-bot.azurewebsites.net/static/js/widget-loader.js"></script>
            <Footer />
        </div>
    );
};

export default HomePage;