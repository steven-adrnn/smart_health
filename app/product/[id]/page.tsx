'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { ReviewSection } from '@/components/ReviewSection';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const ProductPage = () => {
    const params = useParams();
    const id = params?.id as string | undefined; 

    const [product, setProduct] = useState<Database['public']['Tables']['products']['Row'] | null>(null);

    useEffect(() => {
        const getProduct = async () => {
            if (!id) return;

            const { data: productData, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching product:', error);
            } else {
                setProduct(productData);
            }
        };

        getProduct();
    }, [id]);

    const addToCart = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.user) {
                toast.error('Anda harus login'); 
                return;
            }

            // Tambahkan pengecekan null/undefined
            if (!product) {
                toast.error('Produk tidak ditemukan');
                return;
            }

            // Gunakan optional chaining dan nullish coalescing
            const quantity = product.quantity ?? 0;
            if (quantity <= 0) {
                toast.error('Produk habis');
                return;
            }

            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingProductIndex = cart.findIndex((item: { id: string }) => item.id === product.id);

            if (existingProductIndex > -1) {
                if (cart[existingProductIndex].quantity + 1 > quantity) {
                    toast.error(`Stok produk hanya tersisa ${quantity}`);
                    return;
                }
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            toast.success('Produk ditambahkan ke keranjang');
        } catch (err) {
            console.error('Gagal menambahkan produk:', err);
            toast.error('Gagal menambahkan produk');
        }
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="relative w-full h-64 mb-4">
                <Image 
                    // Tambahkan fallback untuk image
                    src={product.image || '/placeholder.png'} 
                    alt={product.name} 
                    fill
                    className="object-cover rounded-md"
                />
            </div>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="font-bold text-green-600 mt-2">Rp {product.price.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Stok: {product.quantity ?? 0}</p>
            <div className="flex items-center mt-4">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="ml-1">{product.rating}</span>
            </div>
            <Button 
                onClick={addToCart} 
                className="w-full mt-4"
                disabled={(product.quantity ?? 0) <= 0}
            >
                {(product.quantity ?? 0) > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
            </Button>
            <ReviewSection productId={product.id} />
        </div>
    );
};

export default ProductPage;