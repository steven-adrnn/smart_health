import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';

type CartItem = Database['public']['Tables']['cart']['Row'] & {
  products: Database['public']['Tables']['products']['Row'];
};

const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const fetchCartItems = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('cart')
                .select('*, products(*)')
                .eq('user_id', session.user.id);

            if (data) setCartItems(data as CartItem[]);
        };

        fetchCartItems();
    }, []);

    const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
        const { error } = await supabase
            .from('cart')
            .update({ quantity: newQuantity })
            .eq('id', cartItemId);

        if (error) {
            console.error('Error updating cart item:', error);
        } else {
            // Refresh cart items
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data } = await supabase
                .from('cart')
                .select('*, products(*)')
                .eq('user_id', session.user.id);

            if (data) setCartItems(data as CartItem[]);
        }
    };

    const handleRemoveFromCart = async (cartItemId: number) => {
        const { error } = await supabase
            .from('cart')
            .delete()
            .eq('id', cartItemId);

        if (error) {
            console.error('Error removing from cart:', error);
        } else {
            // Refresh cart items
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data } = await supabase
                .from('cart')
                .select('*, products(*)')
                .eq('user_id', session.user.id);

            if (data) setCartItems(data as CartItem[]);
        }
    };

    return (
        <div>
            <h2>Cart</h2>
            {cartItems.map((cartItem) => (
                <div key={cartItem.id}>
                    <p>{cartItem.products.name} - ${cartItem.products.price}</p>
                    <p>Quantity: {cartItem.quantity}</p>
                    <input
                        type="number"
                        value={cartItem.quantity}
                        onChange={(e) =>
                            handleQuantityChange(cartItem.id, Number(e.target.value))
                        }
                    />
                    <button onClick={() => handleRemoveFromCart(cartItem.id)}>Remove</button>
                </div>
            ))}
        </div>
    );
};

export default Cart;