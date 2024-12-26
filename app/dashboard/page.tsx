'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const DashboardPage = () => {
    const [user, setUser ] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [points, setPoints] = useState<number>(0);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser (session.user);
                const { data: addressData } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', session.user.id);
                setAddresses(addressData || []);
                
                const { data: pointsData } = await supabase
                    .from('points')
                    .select('points')
                    .eq('user_id', session.user.id);
                setPoints(pointsData?.[0]?.points || 0);
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