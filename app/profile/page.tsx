'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [points, setPoints] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                // Fetch user details
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user:', error);
                    return;
                }

                // Fetch points
                const { data: pointsData } = await supabase
                    .from('points')
                    .select('points')
                    .eq('user_id', session.user.id)
                    .single();

                if (userData) setUser(userData);
                if (pointsData) setPoints(pointsData.points);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('user_session');
        router.push('/login');
        toast.success('Logout berhasil');
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Profil Anda</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                    <strong>Nama:</strong> {user.name}
                </div>
                <div className="mb-4">
                    <strong>Email:</strong> {user.email}
                </div>
                <div className="mb-4">
                    <strong>Poin:</strong> {points}
                </div>
                <Button onClick={handleLogout} className="mt-4">Logout</Button>
            </div>
        </div>
    );
}