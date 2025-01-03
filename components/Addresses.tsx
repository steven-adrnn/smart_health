// components/Addresses.tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'react-hot-toast';
import { MapPin, Plus } from 'lucide-react';

interface AddressesProps {
    onSelectAddress?: (address: string) => void;
    allowAddNew?: boolean;
}

const Addresses: React.FC<AddressesProps> = ({ 
    onSelectAddress, 
    allowAddNew = true 
}) => {
    const [addresses, setAddresses] = useState<Database['public']['Tables']['addresses']['Row'][]>([]);
    const [newAddress, setNewAddress] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', session.user.id);

        if (error) {
            console.error('Error fetching addresses:', error);
            return;
        }

        setAddresses(data || []);
    };

    const handleAddAddress = async () => {
        if (!newAddress.trim()) {
            toast.error('Alamat tidak boleh kosong');
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            toast.error('Anda harus login');
            return;
        }

        const { data, error } = await supabase
            .from('addresses')
            .insert({
                user_id: session.user.id,
                address: newAddress.trim(),
                latitude: null,  // Tambahkan field latitude
                longitude: null  // Tambahkan field longitude
            })
            .select();

        if (error) {
            console.error('Error adding address:', error);
            toast.error('Gagal menambahkan alamat');
            return;
        }

        setAddresses([...addresses, data[0]]);
        setNewAddress('');
        toast.success('Alamat berhasil ditambahkan');
    };

    const handleGetCurrentLocation = () => {
        setIsGeolocationLoading(true);
        
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Gunakan reverse geocoding
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        
                        const formattedAddress = data.display_name || 
                            `Lokasi: ${latitude}, ${longitude}`;

                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session?.user) {
                            toast.error('Anda harus login');
                            return;
                        }

                        const { data: newAddressData, error } = await supabase
                            .from('addresses')
                            .insert({
                                user_id: session.user.id,
                                address: formattedAddress,
                                latitude: latitude.toString(),
                                longitude: longitude.toString()
                            })
                            .select();

                        if (error) {
                            throw error;
                        }

                        setAddresses([...addresses, newAddressData[0]]);
                        toast.success('Lokasi saat ini berhasil ditambahkan');
                    } catch (error) {
                        console.error('Geocoding error:', error);
                        toast.error('Gagal mendapatkan alamat');
                    } finally {
                        setIsGeolocationLoading(false);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    toast.error('Gagal mendapatkan lokasi');
                    setIsGeolocationLoading(false);
                }
            );
        } else {
            toast.error('Geolokasi tidak didukung');
            setIsGeolocationLoading(false);
        }
    };

    const handleSelectAddress = (addressId: string) => {
        setSelectedAddressId(addressId);
        const selectedAddress = addresses.find(addr => addr.id === addressId);
        if (selectedAddress && onSelectAddress) {
            onSelectAddress(selectedAddress.address);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Alamat Anda</h2>
            
            {allowAddNew && (
                <div className="mb-4 space-y-2">
                    <Textarea
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Tambahkan alamat baru"
                    />
                    <div className="flex space-x-2">
                        <Button 
                            onClick={handleAddAddress} 
                            className="flex items-center"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Tambah Alamat Manual
                        </Button>
                        <Button 
                            onClick={handleGetCurrentLocation} 
                            disabled={isGeolocationLoading}
                            className="flex items-center"
                            variant="outline"
                        >
                            <MapPin className="mr-2 h-4 w-4" /> 
                            {isGeolocationLoading ? 'Memuat...' : 'Gunakan Lokasi Saat Ini'}
                        </Button>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {addresses.map(address => (
                    <div 
                        key={address.id} 
                        className={`
                            border p-3 rounded-md cursor-pointer 
                            ${selectedAddressId === address.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-gray-100'}
                        `}
                        onClick={() => handleSelectAddress(address.id)}
                    >
                        <p>{address.address}</p>
                        {address.latitude && address.longitude && (
                            <p className="text-xs text-muted-foreground">
                                Koordinat: {address.latitude}, {address.longitude}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Addresses;