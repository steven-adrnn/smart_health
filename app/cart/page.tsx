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
                        quantity: item.quantity
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
    
            toast.success('Checkout berhasil! Stok produk telah diperbarui.');
            router.push('/');
    
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Terjadi kesalahan saat checkout. Silakan coba lagi.');
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
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => decrementQuantity(item.id)}
                            >
                                -
                            </Button>
                            <span>{item.quantity}</span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => incrementQuantity(item.id)}
                            >
                                +
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => removeItem(item.id)}
                            >
                                Hapus
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">Total:</h2>
                <p className="text-2xl font-bold">
                    Rp {total.toLocaleString()}
                </p>
            </div>
            <Button 
                onClick={handleCheckout} 
                className="w-full mt-4"
            >
                Checkout
            </Button>
        </div>
    );
}