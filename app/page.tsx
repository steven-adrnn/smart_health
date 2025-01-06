import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import Script from 'next/script'
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabaseClient';


export default async function HomePage () {
    // Fetch categories from Supabase
    const { data: categories, error } = await supabase
        .from('categories')
        .select('*');

    return (
        <div>
            <Hero />
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-4">Kategori Produk</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {categories?.map((category) => (
                        <CategoryCard key={category.id} category={category} />
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

