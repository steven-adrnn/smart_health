'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Database } from '@/lib/database.types';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
}

interface Address {
    id: string;
    address: string;
}

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState(0);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
        setCartItems(storedCart);
        calculateTotal(storedCart);
    }, []);

    useEffect(() => {
        const fetchAddresses = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data, error } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', session.user.id);

                if (error) {
                    console.error('Error fetching addresses:', error);
                } else {
                    setAddresses(data || []);
                }
            }
        };

        fetchAddresses();
    }, []);

    const calculateTotal = (items: CartItem[]) => {
        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(totalAmount);
    };

    const handleCheckout = async () => {
        if (!selectedAddress) {
            toast.error('Silakan pilih alamat pengiriman');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                toast.error('Anda harus login terlebih dahulu');
                router.push('/login');
                return;
            }

            // Proses checkout dengan update quantity produk
            const checkoutPromises = cartItems.map(async (item) => {
                // Ambil produk saat ini untuk mendapatkan quantity terkini
                const { data: currentProduct, error: fetchError } = await supabase
                    .from('products')
                    .select('quantity')
                    .eq('id', item.id)
                    .single();

                if (fetchError) {
                    console.error(`Error fetching product ${item.id}:`, fetchError);
                    throw fetchError;
                }

                // Hitung quantity baru
                const newQuantity = Math.max(0, currentProduct.quantity - item.quantity);

                // Update quantity produk di database
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ quantity: newQuantity })
                    .eq('id', item.id);

                if (updateError) {
                    console.error(`Error updating quantity for product ${item.id}:`, updateError);
                    throw updateError;
                }

                // Tambahkan ke tabel cart/order
                const { error: cartError } = await supabase
                    .from('cart')
                    .insert({
                        user_id: session.user.id,
                        product_id: item.id,
                        quantity: item.quantity,
                        address_id: selectedAddress // Sertakan alamat pengiriman
                    });

                if (cartError) {
                    console.error(`Error inserting cart item ${item.id}:`, cartError);
                    throw cartError;
                }
            });

            // Jalankan semua proses checkout
            await Promise.all(checkoutPromises);

            // Tambah poin
            await supabase.rpc('add_points', { 
                user_id: session.user.id, 
                points_to_add: Math.floor(total / 10000) // 1 poin per 10rb
            });

            // Bersihkan cart
            localStorage.removeItem('cart');
            setCartItems([]);
            setTotal(0);
            setSelectedAddress(null); // Reset alamat yang dipilih

            toast.success(' Checkout berhasil! Terima kasih atas pesanan Anda.');

        } catch (error) {
            console.error('Error during checkout:', error);
            toast.error('Terjadi kesalahan saat melakukan checkout');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Keranjang Belanja</h1>
            {cartItems.length === 0 ? (
                <p className="text-gray-500">Keranjang Anda kosong</p>
            ) : (
                <div>
                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b py-2">
                            <Image src={item.image || '/placeholder.png'} alt={item.name} width={50} height={50} />
                            <span>{item.name}</span>
                            <span>{item.price} x {item.quantity}</span>
                        </div>
                    ))}
                    <div className="mt-4">
                        <strong>Total: {total}</strong>
                    </div>
                </div>
            )}

            <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Pilih Alamat Pengiriman</h2>
                {addresses.length > 0 ? (
                    <div>
                        {addresses.map(address => (
                            <div key={address.id} className="flex items-center mb-2">
                                <input
                                    type="radio"
                                    name="address"
                                    value={address.id}
                                    checked={selectedAddress === address.id}
                                    onChange={() => setSelectedAddress(address.id)}
                                    className="mr-2"
                                />
                                <span>{address.address}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Belum ada alamat yang ditambahkan</p>
                )}
            </div>

            <Button onClick={handleCheckout} className="mt-4" disabled={cartItems.length === 0}>
                Checkout
            </Button>
        </div>
    );
}