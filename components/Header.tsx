'use client'

import { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu 
} from 'lucide-react';
import Image from 'next/image';

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

    const menuVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.3,
                ease: "easeInOut" 
            }
        }
    };

    return (
        <motion.header 
            initial="hidden"
            animate="visible"
            variants={menuVariants}
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm h-64"
        >
            <div className="container mx-auto flex justify-between items-center py-4 px-4">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-primary flex items-center">
                    <Image
                        src="/logo.png" 
                        alt="Smart Health Logo" 
                        className="h-10 mr-2"
                    />
                    Smart Health
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex space-x-6 items-center">
                    <Link 
                        href="/shop" 
                        className="text-foreground hover:text-primary transition-colors"
                    >
                        Shop
                    </Link>
                    <Link 
                        href="/forum" 
                        className="text-foreground hover:text-primary transition-colors"
                    >
                        Forum
                    </Link>
                </nav>

                {/* User Actions */}
                <div className="flex items-center space-x-4">
                    {session ? (
                        <div className="flex items-center space-x-4">
                            {/* Cart Icon */}
                            <Link href="/cart" className="relative">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ShoppingCart 
                                        className="text-foreground hover:text-primary" 
                                        size={24} 
                                    />
                                </motion.div>
                            </Link>

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="focus:outline-none"
                                    >
                                        <User 
                                            className="text-foreground hover:text-primary" 
                                            size={24} 
                                        />
                                    </motion.button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>
                                        {session.user?.email}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => router.push('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex space-x-4">
                            <Button 
                                variant="outline" 
                                onClick={() => router.push('/login')}
                            >
                                Login
                            </Button>
                            <Button 
                                onClick={() => router.push('/register')}
                            >
                                Register
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="md:hidden">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="focus:outline-none"
                            >
                                <Menu 
                                    className="text-foreground hover:text-primary" 
                                    size={24} 
                                />
                            </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => router.push('/shop')}>
                                Shop
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => router.push('/forum')}>
                                Forum
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </motion.header>
    );
};

export default Header;