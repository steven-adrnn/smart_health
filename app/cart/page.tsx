'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
// import { Database } from '@/lib/database.types';

// Definisikan tipe untuk cart item
type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string | null;
};

const CartPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const router = useRouter();

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    const handleCheckout = async () => {
        // Dapatkan sesi pengguna dengan cara yang benar
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (!userId) {
            toast.error('Anda harus login untuk checkout');
            router.push('/login');
            return;
        }

        // Simpan data cart ke database
        const cartInsertData = cartItems.map(item => ({
            user_id: userId,
            product_id: item.id,
            quantity: item.quantity
        }));

        const { error } = await supabase.from('cart').insert(cartInsertData);

        if (error) {
            console.error('Checkout error:', error);
            toast.error('Terjadi kesalahan saat checkout');
            return;
        }

        // Hapus cart dari local storage
        localStorage.removeItem('cart');
        setCartItems([]);
        toast.success('Checkout berhasil!');
        router.push('/');
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div className="p-4 container mx-auto">
            <h1 className="text-2xl font-bold mb-4">Keranjang Belanja</h1>
            {cartItems.length === 0 ? (
                <p>Keranjang Anda kosong.</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div 
                                key={item.id} 
                                className="flex justify-between items-center border-b pb-2"
                            >
                                <div className="flex items-center space-x-4">
                                    <span>{item.name}</span>
                                    <span>x {item.quantity}</span>
                                </div>
                                <span>
                                    Rp {(item.price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <strong>Total:</strong>
                        <span className="text-xl font-bold">
                            Rp {calculateTotal().toLocaleString()}
                        </span>
                    </div>
                </>
            )}
            <Button 
                onClick={handleCheckout} 
                className="mt-4 w-full" 
                disabled={cartItems.length === 0}
            >
                Checkout
            </Button>
        </div>
    );
};

export default CartPage;