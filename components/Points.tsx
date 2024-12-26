import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const Points = () => {
    const [points, setPoints] = useState<number>(0);

    useEffect(() => {
        const fetchPoints = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data } = await supabase
                .from('points')
                .select('points')
                .eq('user_id', session.user.id);

            if (data) setPoints(data[0]?.points || 0);
        };

        fetchPoints();
    }, []);

    return (
        <div>
            <h1>Your Points: {points}</h1>
        </div>
    );
};

export default Points;