// components/Addresses.tsx
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'react-hot-toast';
import { MapPin, Locate } from 'lucide-react';



interface AddressesProps {
    onSelectAddress?: (address: Database['public']['Tables']['addresses']['Row']) => void;
    allowAddNew?: boolean;
}

const Addresses: React.FC<AddressesProps> = ({ 
    onSelectAddress, 
    allowAddNew = true 
}) => {
    const [addresses, setAddresses] = useState<Database['public']['Tables']['addresses']['Row'][]>([]);
    const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Database['public']['Tables']['addresses']['Row'] | null>(null);

    useEffect(() => {
        fetchSavedAddresses();
    }, []);

    const fetchSavedAddresses = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        try {
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', session.user.id);

            if (error) throw error;

            // Transform database addresses to AddressDetail
            const formattedAddresses = (data || []).map(addr => ({
                id: addr.id,
                user_id: addr.user_id,
                address: addr.address,
                latitude: parseFloat(addr.latitude || '0'),
                longitude: parseFloat(addr.longitude || '0'),
                street: addr.street,
                city: addr.city,
                province: addr.province,
                postal_code: addr.postal_code,
                created_at: addr.created_at
            }));

            setAddresses(formattedAddresses);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Gagal mengambil alamat tersimpan');
        }
    };

    const getCurrentLocation = () => {
        setIsGeolocationLoading(true);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // Reverse Geocoding
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                        );
                        const data = await response.json();

                        const addressComponents = data.address;
                        const addressDetail: Database['public']['Tables']['addresses']['Row'] = {
                            id: addressComponents.id, // Dummy value
                            user_id: addressComponents.user_id, // Dummy value
                            address: addressComponents.address,
                            latitude,
                            longitude,
                            street: addressComponents.streat || '',
                            city: addressComponents.city || addressComponents.town || '',
                            province: addressComponents.state || addressComponents.province || '',
                            postal_code: addressComponents.postcode || '',
                            created_at: addressComponents.created_at
                        };

                        // Simpan ke database
                        const { data: { session } } = await supabase.auth.getSession();
                        if (!session?.user) {
                            toast.error('Anda harus login');
                            return;
                        }

                        const { error } = await supabase.from('addresses').insert({
                            user_id: session.user.id,
                            address: addressDetail.address,
                            latitude: latitude.toString(),
                            longitude: longitude.toString(),
                            street: addressDetail.street,
                            city: addressDetail.city,
                            province: addressDetail.province,
                            postal_code: addressDetail.postal_code
                        });

                        if (error) throw error;

                        // Update state
                        setAddresses(prev => [...prev, addressDetail]);
                        
                        // Pilih alamat yang baru ditambahkan
                        handleSelectAddress(addressDetail);

                        toast.success('Lokasi berhasil ditambahkan');
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
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            toast.error('Geolokasi tidak didukung');
            setIsGeolocationLoading(false);
        }
    };

    const handleSelectAddress = (address: Database['public']['Tables']['addresses']['Row']) => {
        setSelectedAddress(address);
        if (onSelectAddress) {
            onSelectAddress(address);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                <Button 
                    onClick={getCurrentLocation} 
                    disabled={isGeolocationLoading}
                    className="flex items-center"
                >
                    <Locate className="mr-2 h-4 w-4" />
                    {isGeolocationLoading 
                        ? 'Mendapatkan Lokasi...' 
                        : 'Gunakan Lokasi Saat Ini'}
                </Button>
            </div>

            {addresses.length > 0 && (
                <div className="border rounded-md">
                    <h3 className="text-lg font-semibold p-2 border-b">Alamat Tersimpan</h3>
                    {addresses.map((address, index) => (
                        <div 
                            key={index}
                            onClick={() => handleSelectAddress(address)}
                            className={`
                                p-3 cursor-pointer hover:bg-gray-100 
                                ${selectedAddress === address 
                                    ? 'bg-primary text-primary-foreground' 
                                    : ''}
                            `}
                        >
                            <div className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5" />
                                <div>
                                    <p className="font-medium">{address.address}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Koordinat: {address.latitude}, {address.longitude}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Addresses;