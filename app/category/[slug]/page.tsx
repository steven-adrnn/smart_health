// app/category/[slug]/page.tsx
'use client' 

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { ProductList } from '@/components/ProductList';

type Product = Database['public']['Tables']['products']['Row'];

const CategoryPage = () => {
    const params = useParams();
    const slug = params.slug as string;
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const getProducts = async () => {
            const { data: productsData, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', slug);
            
            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(productsData || []);
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