'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
// import { Database } from '@/lib/database.types';
import { Button } from './ui/button';
// import { toast } from 'react-hot-toast';
import Link from 'next/link';

const CartButton = () => {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const fetchCartCount = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { count, error } = await supabase
                    .from('cart')
                    .select('*', { count: 'exact' })
                    .eq('user_id', session.user.id);

                if (error) {
                    console.error('Error fetching cart count:', error);
                    return;
                }

                setCartCount(count || 0);
            }
        };

        fetchCartCount();
    }, []);

    return (
        <Link href="/cart">
            <Button>
                Cart ({cartCount})
            </Button>
        </Link>
    );
};

export default CartButton;