'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { User, LogOut, MapPin, Award } from 'lucide-react';

const Header = () => {
    const [user, setUser] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
    const [points, setPoints] = useState<number>(0);
    const [addresses, setAddresses] = useState<Database['public']['Tables']['addresses']['Row'][]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                setIsAuthenticated(true);
                await fetchUserData(session.user.id);
            } else {
                setIsAuthenticated(false);
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setIsAuthenticated(true);
                await fetchUserData(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                setUser(null);
                setPoints(0);
                setAddresses([]);
            }
        });

        checkSession();

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const fetchUserData = async (userId: string) => {
        // Ambil data pengguna
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('Error fetching user:', userError);
            return;
        }
        setUser(userData);

        // Ambil poin pengguna
        const { data: pointsData } = await supabase
            .from('points')
            .select('points')
            .eq('user_id', userId)
            .single();
        setPoints(pointsData?.points || 0);

        // Ambil alamat pengguna
        const { data: addressData } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId);
        setAddresses(addressData || []);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const renderProfileContent = () => {
        if (!isAuthenticated) {
            return (
                <DropdownMenuContent>
                    <DropdownMenuItem>
                        <Link href="/login" className="w-full">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href="/register" className="w-full">Register</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            );
        }

        return (
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                        <User className="h-6 w-6" />
                        <span>{user?.name || user?.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem>
                    <Award className="mr-2 h-4 w-4" />
                    <span>Points: {points}</span>
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Addresses ({addresses.length})</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem onSelect={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        );
    };

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto flex justify-between items-center p-4">
                <Link href="/" className="text-2xl font-bold">Smart-Health</Link>
                
                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <User className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        {renderProfileContent()}
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Header;