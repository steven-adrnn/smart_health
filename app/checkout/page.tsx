'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Addresses from '@/components/Addresses';
import { BackButton } from '@/components/BackButton';

type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
};

const CheckoutPage = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(cart);
        calculateTotal(cart);
    }, []);

    const calculateTotal = (items: CartItem[]) => {
        const totalPrice = items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        setTotal(totalPrice);
    };

    const handleCheckout = async () => {
        try {
            // Validasi
            if (cartItems.length === 0) {
                toast.error('Keranjang kosong');
                return;
            }

            if (!selectedAddress) {
                toast.error('Pilih alamat pengiriman');
                return;
            }

            // Ambil sesi pengguna dari localStorage
            const sessionString = localStorage.getItem('user_session');
            if (!sessionString) {
                toast.error('Anda harus login');
                router.push('/login');
                return;
            }

            const sessionData = JSON.parse(sessionString);
            const userId = sessionData.user.id;

            // Transaksi checkout
            const checkoutItems = cartItems.map(item => ({
                user_id: userId,
                product_id: item.id,
                quantity: item.quantity,
                address: selectedAddress
            }));

            // Simpan ke database cart
            const { error } = await supabase.from('cart').insert(checkoutItems);

            if (error) {
                console.error('Checkout error:', error);
                toast.error('Gagal melakukan checkout');
                return;
            }

            // Tambah poin untuk pengguna (misalnya 10 poin per transaksi)
            await supabase.rpc('add_points', { 
                user_id: userId, 
                points_to_add: 10 
            });

            // Bersihkan keranjang
            localStorage.removeItem('cart');

            toast.success('Checkout berhasil! Terima kasih.');
            router.push('/');

        } catch (error) {
            console.error('Checkout error:', error instanceof Error ? error.message : 'Unknown error');
            toast.error('Terjadi kesalahan saat checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <BackButton />
                <h1 className="text-2xl font-bold mb-4">Keranjang Anda Kosong</h1>
                <Button onClick={() => router.push('/shop')}>
                    Mulai Belanja
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <BackButton />
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            {/* Daftar Produk */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Produk Anda</h2>
                {cartItems.map(item => (
                    <div 
                        key={item.id} 
                        className="flex justify-between items-center border-b py-2"
                    >
                        <div>
                            <span>{item.name}</span>
                            <span className="ml-4">x {item.quantity}</span>
                        </div>
                        <span>
                            Rp {(item.price * item.quantity).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            {/* Pilih Alamat */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Pilih Alamat Pengiriman</h2>
                <Addresses onSelectAddress={(address: string) => setSelectedAddress(address)} />
                {selectedAddress && (
                    <div className="mt-2 p-2 bg-green-50 rounded">
                        <strong>Alamat Terpilih:</strong> {selectedAddress}
                    </div>
                )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Total Pembayaran</h2>
                <span className="text-2xl font-bold text-green-600">
                    Rp {total.toLocaleString()}
                </span>
            </div>

            {/* Tombol Checkout */}
            <Button 
                onClick={handleCheckout} 
                disabled={!selectedAddress}
                className="w-full"
            >
                Proses Checkout
            </Button>
        </div>
    );
};

export default CheckoutPage;