'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { User, LogOut, Award } from 'lucide-react';
import CartButton from './Cart';

type UserData = {
    id: string;
    email: string;
};

type AddressData = {
    id: string;
    address: string;
};

const Header = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [points, setPoints] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const sessionString = localStorage.getItem('user_session');
            const userData = localStorage.getItem('user_data');

            if (sessionString && userData) {
                const session = JSON.parse(sessionString);
                const user = JSON.parse(userData);
                setUser(user);

                // Fetch points
                const { data: pointsData } = await supabase
                    .from('points')
                    .select('points')
                    .eq('user_id', user.id)
                    .single();

                setPoints(pointsData?.points || 0);
            }
        };

        checkSession();

        const handleStorageChange = () => {
            checkSession();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem(' user_session');
            localStorage.removeItem('user_data');
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <Link href="/" className="text-2xl font-bold">MyShop</Link>
            <div className="flex items-center">
                <CartButton />
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="outline" className="ml-4">
                                {user.email}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Profil</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <User  className="mr-2" />
                                {user.email}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Award className="mr-2" />
                                Poin: {points}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link href="/login">
                        <Button variant="outline" className="ml-4">Login</Button>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;