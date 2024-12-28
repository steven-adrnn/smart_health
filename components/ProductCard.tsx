'use client'

import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/database.types';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Pastikan import ini


interface ProductCardProps {
    product: Database['public']['Tables']['products']['Row'];
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const addToCart = async () => {
        try {
            // Gunakan Supabase untuk mendapatkan session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                toast.error('Anda harus login');
                return;
            }

            // Cek ketersediaan stok
            if (product.quantity <= 0) {
                toast.error('Produk habis');
                return;
            }

            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingProductIndex = cart.findIndex((item: { id: string }) => item.id === product.id);

            if (existingProductIndex > -1) {
                // Cek apakah jumlah di cart tidak melebihi stok
                if (cart[existingProductIndex].quantity + 1 > product.quantity) {
                    toast.error(`Stok produk hanya tersisa ${product.quantity}`);
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

    const getPublicImageUrl = (path: string) => {
        const cleanPath = path.replace(/\s+/g, '%20');
        return `https://enyvqjbqavjdzxmktahy.supabase.co/storage/v1/object/public/bucket1/${cleanPath}`;
    };

    return (
        <div className="border rounded-lg p-4 shadow-md flex flex-col">
            <Link href={`/product/${product.id}`} className="flex-grow">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {product.image && (
                    <div className="relative w-full h-48 mb-2">
                        <Image 
                            src={product.image 
                                ? getPublicImageUrl(product.image) 
                                : '/placeholder.png'
                            } 
                            alt={product.name} 
                            width={200}  // Tambahkan width
                            height={200} // Tambahkan height
                            className=" object-cover rounded-md"
                            onError={(e) => {
                                console.error('Image load error', product.image);
                                e.currentTarget.src = '/placeholder.png';
                            }}
                        />
                    </div>
                )}
                <p className="text-gray-600 mb-2">{product.description}</p>
                <p className="text-gray-700 mb-1"><strong>Farm:</strong> {product.farm}</p>
                <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1">{product.rating}</span>
                </div>
                <p className="font-bold text-green-600 mt-2">Rp {product.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Stok: {product.quantity}</p>
            </Link>
            <Button 
                onClick={addToCart} 
                className="w-full mt-4"
                disabled={product.quantity <= 0}
            >
                {product.quantity > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
            </Button>
        </div>
    );
};

export default ProductCard;