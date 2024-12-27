// app/page.tsx
// import Header from '@/components/Header';
import { Hero } from '@/components/Hero';
import Categories from '@/components/Categories';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';

const HomePage = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    return (
        <div>
            {/* <Header session={session} /> */}
            <Hero />
            <Categories />
            <Footer />
        </div>
    );
};

export default HomePage;