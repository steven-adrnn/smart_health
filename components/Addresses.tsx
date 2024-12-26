import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Address {
    id: number;
    user_id: number;
    address: string;
}

// In Addresses.tsx
interface AddressesProps {
    onSelectAddress: (selectedAddress: string) => void;
  }
  
const Addresses: React.FC<AddressesProps> = ({ onSelectAddress, ...props }) => {
// component implementation
    const [addresses, setAddresses] = useState<Address[]>([]);

    useEffect(() => {
        const fetchAddresses = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', session.user.id);

            if (data) setAddresses(data as Address[]);
        };

        fetchAddresses();
    }, []);

    return (
        <div>
            <h1>Your Addresses</h1>
            {addresses.map(address => (
                <p key={address.id}>{address.address}</p>
            ))}
        </div>
    );
};

export default Addresses;