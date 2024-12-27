// app/page.tsx
import { Hero } from '@/components/Hero';
import Categories from '@/components/Categories';
import { Footer } from '@/components/Footer';
import { PersonalizedRecipeRecommendation } from '@/components/PersonalizedRecipes';

const HomePage = () => {
    return (
        <div>
            <Hero />
            <Categories />
            <PersonalizedRecipeRecommendation /> {/* Menampilkan rekomendasi resep */}
            <Footer />
        </div>
    );
};

export default HomePage;