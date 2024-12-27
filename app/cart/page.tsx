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
                    .from('users')
                    .select('point')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching points:', error);
                } else {
                    setPoints(data?.point || 0);
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

        if (pointsToUse > points) {
            toast.error('Jumlah poin yang digunakan melebihi poin yang Anda miliki');
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
                setTotal(totalAfterPoints);
                return;
            }
            const pointsEarned = Math.floor(total / 1000); // Asumsi 1 poin = 1000 rupiah

            // Update produk di database (kurangi stok)
            const updateProductPromises = cartItems.map(async (item) => {
                const { data: productData, error: fetchError } = await supabase
                    .from('products')
                    .select('quantity')
                    .eq('id', item.id)
                    .single();

                if (fetchError) {
                    console.error(`Error fetching product ${item.id}:`, fetchError);
                    return null;
                }

                const newQuantity = productData.quantity - item.quantity;
                
                if (newQuantity < 0) {
                    toast.error(`Stok ${item.name} tidak mencukupi`);
                    throw new Error(`Stok ${item.name} tidak mencukupi`);
                }

                const { error: updateError } = await supabase
                    .from('products')
                    .update({ quantity: newQuantity })
                    .eq('id', item.id);

                if (updateError) {
                    console.error(`Error updating product ${item.id}:`, updateError);
                    throw updateError;
                }

                return true;
            });

            // Tunggu semua update produk selesai
            await Promise.all(updateProductPromises);

            // Update poin pengguna
            const newPointTotal = points - pointsToUse + pointsEarned;
            const { error: updatePointsError } = await supabase
                .from('users')
                .update({ point: newPointTotal })
                .eq('id', session.user.id);

            if (updatePointsError) {
                console.error('Error updating points:', updatePointsError);
                toast.error('Gagal mengurangi poin');
                return;
            }

            // Simpan setiap item ke tabel cart
            const cartInsertPromises = cartItems.map(item => 
                supabase
                    .from('cart')
                    .insert({
                        user_id: session.user.id,
                        address_id: selectedAddress,
                        product_id: item.id,
                        quantity: item.quantity
                    })
            );

            const results = await Promise.all(cartInsertPromises);
            const hasError = results.some(result => result.error);

            if (hasError) {
                toast.error('Gagal menyimpan item ke keranjang');
                return;
            }

            // Kosongkan keranjang setelah checkout
            setCartItems([]);
            localStorage.removeItem('cart');
            toast.success('Checkout berhasil! Anda mendapatkan ${pointsEarned} poin.');

            // Redirect ke halaman konfirmasi atau beranda
            router.push('/');
        } catch (error) {
            console.error('Unexpected error during checkout:', error);
            toast.error('Terjadi kesalahan saat checkout');
        }
    };
    
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl">Keranjang </h1>
            <div>
                {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b py-2">
                        <Image src={item.image || '/placeholder.png'} alt={item.name} width={50} height={50} />
                        <div className="flex-1 mx-2">
                            <h2 className="font-bold">{item.name}</h2>
                            <p>Harga: Rp {item.price}</p>
                            <p>Jumlah: {item.quantity}</p>
                        </div>
                        <div>
                            <Button onClick={() => incrementQuantity(item.id)}>+</Button>
                            <Button onClick={() => decrementQuantity(item.id)}>-</Button>
                            <Button onClick={() => removeItem(item.id)}>Hapus</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <h2 className="text-lg">Total: Rp {total}</h2>
                <h3 className="text-lg">Poin Anda: {points}</h3>
                <input
                    type="number"
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Number(e.target.value))}
                    placeholder="Masukkan poin yang ingin digunakan"
                    className="border p-2"
                />
                <Button onClick={handleCheckout} className="mt-2">Checkout</Button>
            </div>

            <div className="mt-4">
                <h2 className="text-lg">Alamat Pengiriman</h2>
                <select onChange={(e) => setSelectedAddress(e.target.value)} className="border p-2">
                    <option value="">Pilih alamat</option>
                    {addresses.map(address => (
                        <option key={address.id} value={address.id}>{address.address}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}