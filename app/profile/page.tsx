'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Database } from '@/lib/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Address = Database['public']['Tables']['addresses']['Row'];

export default function ProfilePage() {
    const [user, setUser ] = useState<User | null>(null);
    const [points, setPoints] = useState(0);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [newAddress, setNewAddress] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                // Fetch user details and points
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*, point') // Ambil kolom point
                    .eq('id', session.user.id)
                    .single();

                if (userError) {
                    console.error('Error fetching user:', userError);
                }

                // Fetch user addresses
                const { data: addressData, error: addressFetchError } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', session.user.id);

                if (addressFetchError) {
                    console.error('Error fetching addresses:', addressFetchError);
                }

                if (userData) {
                    setUser (userData);
                    setPoints(userData.point); // Set poin dari userData
                }
                if (addressData) setAddresses(addressData);
            }
        };

        fetchUserData();
    }, []);

    const handleAddAddress = async () => {
        if (!newAddress.trim()) {
            toast.error('Alamat tidak boleh kosong');
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session?.user) {
                toast.error('Anda harus login');
                return;
            }

            const { data, error } = await supabase
                .from('addresses')
                .insert({
                    user_id: session.user.id,
                    address: newAddress.trim()
                })
                .select();

            if (error) {
                console.error('Error adding address:', error);
                toast.error('Gagal menambahkan alamat');
                return;
            }

            // Update local state
            if (data) {
                setAddresses([...addresses, data[0]]);
                setNewAddress('');
                toast.success('Alamat berhasil ditambahkan');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error('Terjadi kesalahan');
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressId);

            if (error) {
                console.error('Error deleting address:', error);
                toast.error('Gagal menghapus alamat');
                return;
            }

            // Update local state
            setAddresses(addresses.filter(addr => addr.id !== addressId));
            toast.success('Alamat berhasil dihapus');
        } catch (error) {
            console.error('Unexpected error:', error);
            toast.error('Terjadi kesalahan');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('user_session');
        router.push('/login');
        toast.success('Logout berhasil');
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2 px-4">Profil Pengguna</h1>
            <div className="profile-info">
                <h2>Nama: {user.name}</h2>
                <h3>Email: {user.email}</h3>
                <h3>Poin Anda: {points}</h3>
            </div>

            <div className="address-section">
                <h2>Alamat Anda</h2>
                <ul>
                    {addresses.map(address => (
                        <li key={address.id} className="address-item">
                            {address.address}
                            <Button onClick={() => handleDeleteAddress(address.id)}>Hapus</Button>
                        </li>
                    ))}
                </ul>
                <Textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Tambahkan alamat baru"
                />
                <Button onClick={handleAddAddress}>Tambah Alamat</Button>
            </div>

            <Button onClick={handleLogout}>Logout</Button>
        </div>
    );
}