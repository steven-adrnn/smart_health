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
  Globe
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
            className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm h-16"
        >
            <div className="container mx-auto flex justify-between items-center py-4 px-4">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-primary flex items-center">
                    <Image
                        src="/icon.png" 
                        alt="Smart Health Logo" 
                        width={40} 
                        height={40}  
                        className="h-10 mr-2 object-contain"
                    />
                    Smart Health
                </Link>

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
                            {/* Forum Icon */}
                            <Link href="/forum" className="relative">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Globe
                                        className="text-foreground hover:text-primary" 
                                        size={24} 
                                    />
                                </motion.div>
                            </Link>
                            {/* Profil Icon */}
                            <Link href="/profile" className="relative">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <User
                                        className="text-foreground hover:text-primary" 
                                        size={24} 
                                    />
                                </motion.div>
                            </Link>
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
                </div>
            </div>
        </motion.header>
    );
};

export default Header;