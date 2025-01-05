import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import Script from 'next/script'


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

            <Script 
                id="musicmate-config"
                strategy="beforeInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.MUSICMATE_API_KEY = '${process.env.MUSICMATE_API_KEY}';
                    `
                }}
            />
            <Script
                src="https://spotify-bot.azurewebsites.net/static/js/widget-loader.js"
                strategy="afterInteractive"
            />
            <Footer />
        </div>
    );
};

export default HomePage;