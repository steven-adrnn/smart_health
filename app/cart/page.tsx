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
    const [selectedAddress, setSelectedAddress] = useState<string>('');
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
                        created_at: new Date().toISOString()
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
            setSelectedAddress('');
            setPointsToUse(0);

            toast.success(`Checkout berhasil! Anda mendapatkan ${newPoints} poin baru. Terima kasih atas pesanan Anda.`);
            router.push('/');

        } catch (error) {
            console.error('Error during checkout:', error);
            toast.error('Terjadi kesalahan saat melakukan checkout');
        }
    };

    return (
        <div>
            <h1>Keranjang Belanja</h1>
            {cartItems.map(item => (
                <div key={item.id}>
                    <Image src={item.image || '/placeholder.png'} alt={item.name} width={100} height={100} />
                    <h2>{item.name}</h2>
                    <p>Harga: {item.price}</p>
                    <p>Kuantitas: {item.quantity}</p>
                    <Button onClick={() => incrementQuantity(item.id)}>+</Button>
                    <Button onClick={() => decrementQuantity(item.id)}>-</Button>
                    <Button onClick={() => removeItem(item.id)}>Hapus</Button>
                </div>
            ))}
            <h2>Total: {total}</h2>
            <select onChange={(e) => setSelectedAddress(e.target.value)} value={selectedAddress}>
                <option value="">Pilih Alamat</option>
                {addresses.map(address => (
                    <option key={address.id} value={address.id}>{address.address}</option>
                ))}
            </select>
            <input
                type="number"
                value={pointsToUse}
                onChange={(e) => setPointsToUse(Number(e.target.value))}
                placeholder="Gunakan Poin"
            />
            <Button onClick={handleCheckout}>Checkout</Button>
        </div>
    );
}