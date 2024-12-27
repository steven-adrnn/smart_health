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
    const [user, setUser] = useState<User | null>(null);
    const [points, setPoints] = useState(0);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [newAddress, setNewAddress] = useState('');
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
                }

                // Fetch user addresses
                const { data: addressData, error: addressFetchError } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', session.user.id);

                if (addressFetchError) {
                    console.error('Error fetching addresses:', addressFetchError);
                }

                // Fetch points
                const { data: pointsData } = await supabase
                    .from('points')
                    .select('points')
                    .eq('user_id', session.user.id)
                    .single();

                if (userData) setUser(userData);
                if (addressData) setAddresses(addressData);
                if (pointsData) setPoints(pointsData.points);
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
            <h1 className="text-2xl font-bold mb-4">Profil Anda</h1>
            <div className="bg-white shadow-md rounded-lg p-6 mb-4">
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

            {/* Manajemen Alamat */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Alamat Anda</h2>
                
                {/* Tambah Alamat Baru */}
                <div className="mb-4">
                    <Textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Masukkan alamat lengkap"
                        className="mb-2"
                    />
                    <Button 
                        onClick={handleAddAddress} 
                        className="w-full"
                    >
                        Tambah Alamat
                    </Button>
                </div>

                {/* Daftar Alamat */}
                {addresses.length > 0 ? (
                    <div>
                        {addresses.map((address) => (
                            <div 
                                key={address.id} 
                                className="flex justify-between items-center border-b py-2"
                            >
                                <span>{address.address}</span>
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteAddress(address.id)}
                                >
                                    Hapus
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Belum ada alamat</p>
                )}
            </div>
        </div>
    );
}