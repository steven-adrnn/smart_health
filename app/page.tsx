// app/page.tsx
import { Hero } from '@/components/Hero';
import Categories from '@/components/Categories';
import { Footer } from '@/components/Footer';

const HomePage = () => {
    return (
        <div>
            <Hero />
            <Categories />
            <Footer />
        </div>
    );
};

export default HomePage;