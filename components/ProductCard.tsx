'use client'

// import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/database.types';

interface ProductCardProps {
    product: Database['public']['Tables']['products']['Row'];
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const addToCart = () => {
        try {
            const sessionString = localStorage.getItem('user_session');
            if (!sessionString) {
                toast.error('Anda harus login');
                return;
            }

            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingProductIndex = cart.findIndex((item: { id: string }) => item.id === product.id);

            if (existingProductIndex > -1) {
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
                className="w-full mt-2"
            >
                Tambah ke Keranjang
            </Button>
        </div>
    );
};

export default ProductCard;