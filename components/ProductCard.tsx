'use client'

import { useState } from 'react';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
    product: Database['public']['Tables']['products']['Row'];
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const [isAdding, setIsAdding] = useState(false);

    const addToCart = async () => {
        setIsAdding(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.user) {
                toast.error('Anda harus login terlebih dahulu');
                return;
            }

            // Cek apakah produk sudah ada di keranjang
            const { data: existingCartItem, error: checkError } = await supabase
                .from('cart')
                .select('*')
                .eq('user_id', session.user.id)
                .eq('product_id', product.id)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingCartItem) {
                // Update quantity jika produk sudah ada
                const { error: updateError } = await supabase
                    .from('cart')
                    .update({ quantity: existingCartItem.quantity + 1 })
                    .eq('id', existingCartItem.id);

                if (updateError) throw updateError;
                toast.success('Kuantitas produk diperbarui di keranjang');
            } else {
                // Tambahkan produk baru ke keranjang
                const { error } = await supabase
                    .from('cart')
                    .insert({
                        user_id: session.user.id,
                        product_id: product.id,
                        quantity: 1
                    });

                if (error) throw error;
                toast.success('Produk ditambahkan ke keranjang');
            }
        } catch (error) {
            console.error('Gagal menambahkan ke keranjang:', error);
            toast.error('Gagal menambahkan produk ke keranjang');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="border rounded-lg p-4 shadow-md">
            <Link href={`/product/${product.id}`}>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {product.image && (
                    <div className="relative w-full h-48 mb-2">
                        <Image 
                            src={product.image} 
                            alt={product.name} 
                            fill
                            className="object-cover rounded-md"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                )}
                <p className="text-gray-600">{product.description}</p>
                <p className="font-bold text-green-600">Rp {product.price.toLocaleString()}</p>
            </Link>
            <Button 
                onClick={addToCart} 
                disabled={isAdding} 
                className="w-full mt-2"
            >
                {isAdding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
            </Button>
        </div>
    );
};

export default ProductCard;