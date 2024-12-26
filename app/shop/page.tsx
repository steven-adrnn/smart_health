// import { ProductList } from '@/components/ProductList'
// import { getAllProducts } from '@/lib/products'

// export default function ShopPage() {
//   const products = getAllProducts()

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-6">All Products</h1>
//       {products.length > 0 ? (
//         <ProductList products={products} />
//       ) : (
//         <p>No products available at the moment.</p>
//       )}
//     </div>
//   )
// }



// app/shop/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import ProductCard from '@/components/ProductCard';

const ShopPage = () => {
    const [products, setProducts] = useState<Database['public']['Tables']['products']['Row'][]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div>
            <h1>Shop</h1>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ShopPage;