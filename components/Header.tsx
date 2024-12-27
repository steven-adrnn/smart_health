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
import { LogOut, User, Award, ShoppingCart } from 'lucide-react';

type UserData = {
    id: string;
    email: string;
    name: string;
};

const Header = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [points, setPoints] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                const userData = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || 'User'
                };
                
                setUser(userData);

                // Fetch points
                const { data: pointsData } = await supabase
                    .from('points')
                    .select('points')
                    .eq('user_id', userData.id)
                    .single();

                setPoints(pointsData?.points || 0);
            }
        };

        checkSession();
        
        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                checkSession();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <Link href="/" className="text-xl font-bold">Smart Health</Link>
            <div className="flex items-center space-x-4">
                <Link href="/shop">
                    <Button variant="ghost">
                        <ShoppingCart className="mr-2" /> Shop
                    </Button>
                </Link>

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <User className="mr-2" /> {user.name}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/profile')}>
                                <User className="mr-2" /> Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Award className="mr-2" /> Points: {points}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="space-x-2">
                        <Link href="/login">
                            <Button variant="outline">Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button>Register</Button>
                        </Link>
                    </div>
                )}

                <Link href="/cart">
                    <Button variant="outline">
                        <ShoppingCart className="mr-2" /> Cart
                    </Button>
                </Link>
            </div>
        </header>
    );
};

export default Header;