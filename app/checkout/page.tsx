'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState<Database['public']['Tables']['cart']['Row'][]>([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchCartItems = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                toast.error('Anda harus login');
                return;
            }

            const { data, error } = await supabase
                .from('cart')
                .select('*, products(*)') // Mengambil data produk terkait
                .eq('user_id', session.user.id);

            if (error) {
                console.error('Error fetching cart items:', error);
                return;
            }

            setCartItems(data as Database['public']['Tables']['cart']['Row'][]);
            calculateTotal(data);
        };

        fetchCartItems();
    }, []);

    const calculateTotal = (items: Database['public']['Tables']['cart']['Row'][]) => {
        const totalPrice = items.reduce((sum, item) => 
            sum + (item.product.price * item.quantity), 0
        );
        setTotal(totalPrice);
    };

    const handlePayment = async (method: string) => {
        // Logika untuk memproses pembayaran
        toast.success(`Pembayaran berhasil menggunakan ${method}`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>
            <h2 className="text-xl">Total: Rp {total.toLocaleString()}</h2>
            <div className="mt-4">
                <h3 className="font-semibold">Pilih Metode Pembayaran:</h3>
                <Button onClick={() => handlePayment('Kartu Kredit')} className="mt-2">Kartu Kredit</Button>
                <Button onClick={() => handlePayment('Transfer Bank')} className="mt-2">Transfer Bank</Button>
                <Button onClick={() => handlePayment('E-Wallet')} className="mt-2">E-Wallet</Button>
            </div>
        </div>
    );
};

export default CheckoutPage;