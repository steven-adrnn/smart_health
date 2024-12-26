// import { ProductList } from '@/components/ProductList'
// import { getProductsByCategory } from '@/lib/products'

// export default function CategoryPage({ params }: { params: { slug: string } }) {
//   const products = getProductsByCategory(params.slug)

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6 capitalize">{params.slug}</h1>
//       {products.length > 0 ? (
//         <ProductList products={products} />
//       ) : (
//         <p>No products found in this category.</p>
//       )}
//     </div>
//   )
// }



// app/category/[slug]/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { ProductList } from '@/components/ProductList';

const CategoryPage = () => {
    const router = useRouter();
    const { slug } = router.query;

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const getProducts = async () => {
            const { data: productsData, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', slug);
            if (error) {
                alert('Error fetching products: ' + error.message);
            } else {
                setProducts(productsData);
            }
        };
        getProducts();
    }, [slug]);

    return (
        <div>
            <h1>Category: {slug}</h1>
            <ProductList products={products} />
        </div>
    );
};

export default CategoryPage;