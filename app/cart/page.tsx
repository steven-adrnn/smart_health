'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function CartPage() {
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(storedCart);
        calculateTotal(storedCart);
    }, []);

    const calculateTotal = (items: any[]) => {
        const totalAmount = items.reduce((acc, item) => acc + item.price, 0);
        setTotal(totalAmount);
    };

    const handleCheckout = async () => {
        const { data, error } = await supabase
            .from('cart')
            .insert(cartItems);

        if (error) {
            toast.error('Terjadi kesalahan saat checkout');
            return;
        }

        localStorage.removeItem('cart');
        setCartItems([]);
        toast.success('Checkout berhasil!');
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
                                <span>{item.price} IDR</span>
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