'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { ProductList } from '@/components/ProductList';
import { toast } from 'react-hot-toast';

const ShopPage = () => {
    const [products, setProducts] = useState<Database['public']['Tables']['products']['Row'][]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                
                // Pastikan sesi valid sebelum fetch
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.user) {
                    throw new Error('Anda harus login terlebih dahulu');
                }

                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    throw error;
                }

                if (!data || data.length === 0) {
                    toast.error('Tidak ada produk yang tersedia');
                }

                setProducts(data || []);
                setLoading(false);
            } catch (err: unknown) { // Ganti dari any ke unknown
                const errorMessage = err instanceof Error 
                    ? err.message 
                    : 'Gagal memuat produk';
                
                console.error('Error fetching products:', err);
                toast.error(errorMessage);
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); 

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Memuat produk...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Produk Kami</h1>
            {products.length > 0 ? (
                <ProductList products={products} />
            ) : (
                <p>Tidak ada produk yang tersedia.</p>
            )}
        </div>
    );
};

export default ShopPage;