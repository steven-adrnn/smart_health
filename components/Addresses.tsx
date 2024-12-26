import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';

interface AddressesProps {
    onSelectAddress?: (address: string) => void;
}

const Addresses: React.FC<AddressesProps> = ({ onSelectAddress }) => {
    const [addresses, setAddresses] = useState<Database['public']['Tables']['addresses']['Row'][]>([]);

    useEffect(() => {
        const fetchAddresses = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error: fetchError } = await supabase
                .from('addresses')
                .select('id, user_id, address, created_at')
                .eq('user_id', session.user.id);

            if (fetchError) {
                console.error('Error fetching addresses:', fetchError);
                return;
            }

            setAddresses(data || []);
        };

        fetchAddresses();
    }, []);

    return (
        <div>
            <h2>Your Addresses</h2>
            {addresses.map(address => (
                <div key={address.id} onClick={() => onSelectAddress && onSelectAddress(address.address)}>
                    <p>{address.address}</p>
                </div>
            ))}
        </div>
    );
};

export default Addresses;