'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';

const DashboardPage = () => {
    const [user, setUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
    const [addresses, setAddresses] = useState<Database['public']['Tables']['addresses']['Row'][]>([]);
    const [points, setPoints] = useState<number>(0);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (userError) {
                    console.error('Error fetching user:', userError);
                    return;
                }

                setUser(userData);

                const { data: addressData, error: addressError } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', session.user.id);

                if (addressError) {
                    console.error('Error fetching addresses:', addressError);
                    return;
                }

                setAddresses(addressData || []);
                
                const { data: pointsData, error: pointsError } = await supabase
                    .from('points')
                    .select('points')
                    .eq('user_id', session.user.id);

                if (pointsError) {
                    console.error('Error fetching points:', pointsError);
                    return;
                }

                setPoints(pointsData[0]?.points || 0);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            {user && <p>Welcome, {user.email}</p>}
            <h2>Your Addresses</h2>
            {addresses.map(address => (
                <p key={address.id}>{address.address}</p>
            ))}
            <h2>Your Points: {points}</h2>
        </div>
    );
};

export default DashboardPage;