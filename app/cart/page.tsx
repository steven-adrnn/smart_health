'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    const [points, setPoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);
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

        const fetchUserPoints = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data, error } = await supabase
                    .from('points')
                    .select('points')
                    .eq('user_id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching points:', error);
                } else {
                    setPoints(data?.points || 0);
                }
            }
        };

        fetchAddresses();
        fetchUserPoints();
    }, []);

    const calculateTotal = (items: CartItem[]) => {
        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotal(totalAmount);
    };

    const incrementQuantity = (itemId: string) => {
        const updatedCart = cartItems.map(item => 
            item.id === itemId 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        calculateTotal(updatedCart);
    };

    const decrementQuantity = (itemId: string) => {
        const updatedCart = cartItems.map(item => 
            item.id === itemId && item.quantity > 1
                ? { ...item, quantity: item.quantity - 1 }
                : item
        ).filter(item => item.quantity > 0);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        calculateTotal(updatedCart);
    };

    const removeItem = (itemId: string) => {
        const updatedCart = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        calculateTotal(updatedCart);
        toast.success('Produk dihapus dari keranjang');
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
    
            // Hitung total setelah menggunakan poin
            const totalAfterPoints = total - pointsToUse;
    
            // Pastikan total tidak negatif
            if (totalAfterPoints < 0) {
                toast.error('Jumlah poin yang digunakan melebihi total biaya');
                return;
            }
    
            // Proses checkout dengan update quantity produk
            const checkoutPromises = cartItems.map(async (item) => {
                const { data: currentProduct, error: fetchError } = await supabase
                    .from('products')
                    .select('quantity')
                    .eq('id', item.id)
                    .single();
    
                if (fetchError) {
                    console.error(`Error fetching product ${item.id}:`, fetchError);
                    throw fetchError;
                }
    
                const newQuantity = Math.max(0, currentProduct.quantity - item.quantity);
    
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ quantity: newQuantity })
                    .eq('id', item.id);
    
                if (updateError) {
                    console.error(`Error updating quantity for product ${item.id}:`, updateError);
                    throw updateError;
                }
    
                const { error: cartError } = await supabase
                    .from('cart')
                    .insert({
                        user_id: session.user.id,
                        product_id: item.id,
                        quantity: item.quantity,
                        address_id: selectedAddress
                    });
    
                if (cartError) {
                    console.error(`Error inserting cart item ${item.id}:`, cartError);
                    throw cartError;
                }
            });
    
            await Promise.all(checkoutPromises);
    
            // Kurangi poin yang digunakan dari total poin pengguna
            if (pointsToUse > 0) {
                const { error: updatePointsError } = await supabase
                    .from('points')
                    .update({ points: points - pointsToUse })
                    .eq('user_id', session.user.id);
    
                if (updatePointsError) {
                    console.error('Error updating points:', updatePointsError);
                    toast.error('Gagal memperbarui poin');
                    return;
                }
            }
    
            // Tambahkan poin baru berdasarkan total pembelian
            const newPoints = Math.floor(totalAfterPoints / 100);
            const { data: existingPointsData, error: fetchPointsError } = await supabase
                .from('points')
                .select('points')
                .eq('user_id', session.user.id)
                .single();
    
            if (fetchPointsError) {
                console.error('Error fetching points:', fetchPointsError);
                toast.error('Gagal mengambil data poin');
                return;
            }
    
            if (existingPointsData) {
                const updatedPoints = existingPointsData.points + newPoints;
                await supabase
                    .from('points')
                    .update({ points: updatedPoints })
                    .eq('user_id', session.user.id);
            } else {
                await supabase
                    .from('points')
                    .insert({
                        user_id: session.user.id,
                        points: newPoints
                    });
            }
    
            localStorage.removeItem('cart');
            setCartItems([]);
            setTotal(0);
            setSelectedAddress(null);
            setPointsToUse(0);
    
            toast.success(`Checkout berhasil! Anda mendapatkan ${newPoints} poin baru. Terima kasih atas pesanan Anda.`);
            router.push('/');
    
        } catch (error) {
            console.error('Error during checkout:', error);
            toast.error('Terjadi kesalahan saat melakukan checkout');
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Keranjang Anda Kosong</h1>
                <Button onClick={() => router.push('/shop')}>
                    Mulai Belanja
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Keranjang Belanja</h1>
            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div 
                        key={item.id} 
                        className="flex items-center justify-between border-b pb-4"
                    >
                        {item.image && (
                            <Image 
                                src={item.image} 
                                alt={item.name} 
                                width={80} 
                                height={80} 
                                className="object-cover rounded"
                            />
                        )}
                        <div className="flex-grow ml-4">
                            <h2 className="text-lg font-semibold">{item.name}</h2>
                            <p>Rp {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button onClick={() => decrementQuantity(item.id)}>-</Button>
                            <span>{item.quantity}</span>
                            <Button onClick={() => incrementQuantity(item.id)}>+</Button>
                            <Button onClick={() => removeItem(item.id)} className="text-red-500">Hapus</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <strong>Total: Rp {total.toLocaleString()}</strong>
            </div>

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

            <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Gunakan Poin</h2>
                <p>Poin Anda: {points}</p>
                <input
                    type="number"
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Math.min(Number(e.target.value), points))}
                    className="border rounded p-2"
                    placeholder="Masukkan jumlah poin yang ingin digunakan"
                />
            </div>

            <Button onClick={handleCheckout} className="mt-4" disabled={cartItems.length === 0}>
                Checkout
            </Button>
        </div>
    );
}