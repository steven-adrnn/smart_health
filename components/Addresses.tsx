// components/Addresses.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'react-hot-toast';
import { MapPin, Trash2 } from 'lucide-react';

interface AddressesProps {
    onSelectAddress?: (address: Database['public']['Tables']['addresses']['Row']) => void;
    allowAddNew?: boolean;
    showActions?: boolean;
}

const Addresses: React.FC<AddressesProps> = ({ 
    onSelectAddress, 
    allowAddNew = true,
    showActions = false
}) => {
    const [addresses, setAddresses] = useState<Database['public']['Tables']['addresses']['Row'][]>([]);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        province: '',
        postalCode: ''
    });
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

    const validateAddress = () => {
        const { street, city, province, postalCode } = newAddress;
        
        if (!street.trim()) {
            toast.error('Alamat jalan harus diisi');
            return false;
        }
        
        if (!city.trim()) {
            toast.error('Kota harus diisi');
            return false;
        }
        
        if (!province.trim()) {
            toast.error('Provinsi harus diisi');
            return false;
        }
        
        if (!postalCode.trim() || !/^\d{5}$/.test(postalCode)) {
            toast.error('Kode pos harus 5 digit');
            return false;
        }

        return true;
    };

    const handleAddAddress = async () => {
        if (!validateAddress()) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            toast.error('Anda harus login');
            return;
        }

        const formattedAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.province} ${newAddress.postalCode}`;

        try {
            // Geocoding untuk mendapatkan koordinat
            const geocodingResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formattedAddress)}`
            );
            const geocodingData = await geocodingResponse.json();

            let latitude = null;
            let longitude = null;

            if (geocodingData && geocodingData.length > 0) {
                latitude = geocodingData[0].lat;
                longitude = geocodingData[0].lon;
            }

            const { data, error } = await supabase
                .from('addresses')
                .insert({
                    user_id: session.user.id,
                    address: formattedAddress,
                    latitude: latitude,
                    longitude: longitude,
                    street: newAddress.street,
                    city: newAddress.city,
                    province: newAddress.province,
                    postal_code: newAddress.postalCode
                })
                .select();

            if (error) {
                throw error;
            }

            setAddresses([...addresses, data[0]]);
            setNewAddress({
                street: '',
                city: '',
                province: '',
                postalCode: ''
            });
            toast.success('Alamat berhasil ditambahkan');
        } catch (error) {
            console.error('Error adding address:', error);
            toast.error('Gagal menambahkan alamat');
        }
    };

    const handleGetCurrentLocation = () => {
        setIsGeolocationLoading(true);
        
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Reverse geocoding
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();
                        
                        const address = data.address;
                        const formattedAddress = `${address.road || ''}, ${address.city || address.town || ''}, ${address.state || ''} ${address.postcode || ''}`;

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
                                longitude: longitude.toString(),
                                street: address.road || '',
                                city: address.city || address.town || '',
                                province: address.state || '',
                                postal_code: address.postcode || ''
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

    const handleDeleteAddress = async (addressId: string) => {
        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressId);

            if (error) {
                throw error;
            }

            setAddresses(addresses.filter(addr => addr.id !== addressId));
            toast.success('Alamat berhasil dihapus');
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Gagal menghapus alamat');
        }
    };

    const handleSelectAddress = (address: Database['public']['Tables']['addresses']['Row']) => {
        setSelectedAddressId(address.id);
        if (onSelectAddress) {
            onSelectAddress(address);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Alamat Anda</h2>
            
            {allowAddNew && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Tambah Alamat Baru</h3>
                    <Input 
                        placeholder="Jalan" 
                        value={newAddress.street} 
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} 
                    />
                    <Input 
                        placeholder="Kota" 
                        value={newAddress.city} 
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} 
                    />
                    <Input 
                        placeholder="Provinsi" 
                        value={newAddress.province} 
                        onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })} 
                    />
                    <Input 
                        placeholder="Kode Pos" 
                        value={newAddress.postalCode} 
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} 
                    />
                    <Button onClick={handleAddAddress}>Tambah Alamat</Button>
                    <Button onClick={handleGetCurrentLocation} disabled={isGeolocationLoading}>
                        {isGeolocationLoading ? 'Mendapatkan lokasi...' : 'Gunakan Lokasi Saat Ini'}
                    </Button>
                </div>
            )}

            {addresses.length === 0 ? (
                <p>Tidak ada alamat yang tersedia.</p>
            ) : (
                addresses.map(address => (
                    <div key={address.id} className="flex justify-between items-center border-b py-2">
                        <div onClick={() => handleSelectAddress(address)} className={`cursor-pointer ${selectedAddressId === address.id ? 'font-bold' : ''}`}>
                            <MapPin className="inline mr-2" />
                            {address.address}
                        </div>
                        {showActions && (
                            <Button onClick={() => handleDeleteAddress(address.id)} variant="destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default Addresses;