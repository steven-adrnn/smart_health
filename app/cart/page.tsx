'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Definisikan tipe untuk cart item
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        setCartItems(storedCart);
        calculateTotal(storedCart);
    }, []);

    const calculateTotal = (items: CartItem[]) => {
        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(totalAmount);
    };

    const handleCheckout = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                toast.error('Anda harus login terlebih dahulu');
                router.push('/login');
                return;
            }

            // Tambahkan user_id ke setiap item cart
            const cartWithUserId = cartItems.map(item => ({
                ...item,
                user_id: session.user.id
            }));

            const { error } = await supabase
                .from('cart')
                .insert(cartWithUserId);

            if (error) {
                console.error('Checkout error:', error);
                toast.error('Terjadi kesalahan saat checkout');
                return;
            }

            // Tambahkan poin
            await supabase.rpc('add_points', { 
                user_id: session.user.id, 
                points_to_add: 10 
            });

            localStorage.removeItem('cart');
            setCartItems([]);
            toast.success('Checkout berhasil!');
            router.push('/');
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Terjadi kesalahan saat checkout');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Keranjang Belanja</h1>
            {cartItems.length === 0 ? (
                <div>Keranjang Anda kosong</div>
            ) : (
                <div>
                    <ul>
                        {cartItems.map((item, index) => (
                            <li key={index} className="flex justify-between mb-2">
                                <span>{item.name}</span>
                                <span>
                                    {item.price * item.quantity} IDR 
                                    (Qty: {item.quantity})
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="font-bold mt-4">Total: {total} IDR</div>
                    <Button onClick={handleCheckout} className="mt-4">Checkout</Button>
                </div>
            )}
        </div>
    );
}