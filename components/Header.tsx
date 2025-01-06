'use client'

import { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';


interface HeaderProps {
    session: Session | null;
}

const Header: React.FC<HeaderProps> = ({ session }) => {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('user_session');
        router.push('/login');
    };

    return (
        <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
            <Link href="/" className="text-xl font-bold">Smart Health</Link>
            <nav className="flex space-x-4 items-center">
                <Link href="/shop">Shop</Link>
                {session ? (
                    <>
                        <Link href="/profile">Profile</Link>
                        <Link href="/cart">Cart</Link>
                        <Link href="/forum">Forum</Link>
                        <Button onClick={handleLogout} variant="destructive">Logout</Button>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button>Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline">Register</Button>
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;