// app/page.tsx
import Header from '@/components/Header';
import { Hero } from '@/components/Hero';
import Categories from '@/components/Categories';
// import { Footer } from '@/components/Footer';

const HomePage = () => {
    return (
        <div>
            <Header />
            <Hero />
            <Categories />
            {/* <Footer /> */}
        </div>
    );
};

export default HomePage;