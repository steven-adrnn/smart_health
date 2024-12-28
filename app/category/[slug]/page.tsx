'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ProductList } from '@/components/ProductList';
import { Database } from '@/lib/database.types';

const CategoryPage = () => {
    const params = useParams();
    const slug = params?.slug as string; // Mengambil slug dari URL
    const [products, setProducts] = useState<Database['public']['Tables']['products']['Row'][]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category', slug) // Mengambil produk berdasarkan kategori
                    .gt('quantity', 0) // Hanya produk dengan stok > 0
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                setProducts(data || []);
                setLoading(false);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Gagal memuat produk';
                console.error('Error fetching products:', err);
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slug]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Memuat produk...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500"><p>{error}</p></div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Produk Kategori: {slug.charAt(0).toUpperCase() + slug.slice(1)}</h2>
            <ProductList products={products} />
        </div>
    );
};

export default CategoryPage;