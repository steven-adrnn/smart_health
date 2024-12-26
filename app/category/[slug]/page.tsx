'use client'  // Pastikan ini ada di paling atas file

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';  // Ganti dari next/router
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { ProductList } from '@/components/ProductList';

type Product = Database['public']['Tables']['products']['Row'];

const CategoryPage = () => {
    const params = useParams();
    const slug = params.slug as string | undefined; // Menambahkan undefined untuk menghindari error

    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const getProducts = async () => {
            if (!slug) return; // Pastikan slug tidak null atau undefined

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