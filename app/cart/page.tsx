'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

type CartItemWithProduct = Database['public']['Tables']['cart']['Row'] & {
    products: Database['public']['Tables']['products']['Row']
};

const CartPage = () => {
    const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
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
                .select('*, products(*)')
                .eq('user_id', session.user.id);

            if (error) {
                console.error('Error fetching cart items:', error);
                return;
            }

            setCartItems(data as CartItemWithProduct[]);
            calculateTotal(data as CartItemWithProduct[]);
        };

        fetchCartItems();
    }, []);

    const calculateTotal = (items: CartItemWithProduct[]) => {
        const totalPrice = items.reduce((sum, item) => 
            sum + (item.products.price * item.quantity), 0
        );
        setTotal(totalPrice);
    };

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            await removeItem(itemId);
            return;
        }

        const { error } = await supabase
            .from('cart')
            .update({ quantity: newQuantity })
            .eq('id', itemId);

        if (error) {
            toast.error('Gagal memperbarui kuantitas');
            return;
        }

        const updatedItems = cartItems.map(item => 
            item.id === itemId 
                ? { ...item, quantity: newQuantity } 
                : item
        );
        
        setCartItems(updatedItems);
        calculateTotal(updatedItems);
    };

    const removeItem = async (itemId: string) => {
        const { error } = await supabase
            .from('cart')
            .delete()
            .eq('id', itemId);

        if (error) {
            toast.error('Gagal menghapus item');
            return;
        }

        const updatedItems = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedItems);
        calculateTotal(updatedItems);
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto p-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Keranjang Anda Kosong</h1>
                <Link href="/shop">
                    <Button>Mulai Belanja</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Keranjang Anda</h1>
            {cartItems.map(item => (
                <div 
                    key={item.id} 
                    className="flex items-center justify-between border-b py-2"
                >
                    <div className="flex items-center">
                        <Image 
                            src={item.products.image ?? '/default-image.jpg'} // provide a default image URLs 
                            alt={item.products.name} 
                            width={64} // Atur lebar sesuai kebutuhan
                            height={64} // Atur tinggi sesuai kebutuhan
                            className="object-cover rounded-md mr-4" 
                        />
                        <div>
                            <h2 className="font-semibold">{item.products.name}</h2>
                            <p className="text-gray-600">Rp {item.products.price.toLocaleString()}</p>
                            <div className="flex items-center mt-2">
                                <Button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </Button>
                                <span className="mx-2">{item.quantity}</span>
                                <Button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    +
                                </Button>
                                <Button 
                                    onClick={() => removeItem(item.id)} 
                                    className="ml-4 text-red-500"
                                >
                                    Hapus
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <div className="flex justify-between mt-4">
                <h2 className="text-xl font-bold">Total: Rp {total.toLocaleString()}</h2>
                <Link href="/checkout">
                    <Button>Checkout</Button>
                </Link>
            </div>
        </div>
    );
};

export default CartPage;