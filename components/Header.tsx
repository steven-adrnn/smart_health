// import { ShoppingCart, Menu, User } from 'lucide-react'
// import Link from 'next/link'

// export function Header() {
//   return (
//     <header className="bg-green-500 text-white p-4">
//       <div className="container mx-auto flex justify-between items-center">
//         <Link href="/" className="text-2xl font-bold">Smart-Health</Link>
//         <nav className="hidden md:flex space-x-4">
//           <Link href="/" className="hover:text-green-200">Home</Link>
//           <Link href="/category/fruits" className="hover:text-green-200">Fruits</Link>
//           <Link href="/category/vegetables" className="hover:text-green-200">Vegetables</Link>
//           <Link href="/category/meat" className="hover:text-green-200">Meat</Link>
//           <Link href="/category/dairy" className="hover:text-green-200">Dairy</Link>
//         </nav>
//         <div className="flex items-center space-x-4">
//           <Link href="/cart">
//             <ShoppingCart className="h-6 w-6 cursor-pointer" />
//           </Link>
//           <Link href="/login">
//             <User className="h-6 w-6 cursor-pointer" />
//           </Link>
//           <Menu className="h-6 w-6 cursor-pointer md:hidden" />
//         </div>
//       </div>
//     </header>
//   )
// }



// components/Header.tsx
'use client'  // Pastikan ini ada di paling atas file

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import Link from 'next/link';

const Header = () => {
    const [user, setUser ] = useState<Database['public']['Tables']['users']['Row'] | null>(null);

    useEffect(() => {
      const fetchUser = async () => {
          const { data: { session } } = await supabase.auth.getSession();
  
          if (session?.user) {
              const { data: userData } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', session.user.email)
                  .single();
  
              if (userData) {
                  setUser(userData);
              }
          }
      };
  
      fetchUser();
  
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_, session) => {
          if (session?.user) {
              const { data: userData } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', session.user.email)
                  .single();
  
              if (userData) {
                  setUser(userData);
              }
          } else {
              setUser(null);
          }
      });
  
      return () => {
          authListener.subscription.unsubscribe();
      };
    }, []);
  

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser (null);
    };

    return (
        <header>
            <h1>My App</h1>
            {user ? (
                <div>
                    <p>Welcome, {user.email}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <div>
                    <Link href="/login">Login</Link>
                    <Link href="/register">Register</Link>
                </div>
            )}
        </header>
    );
};

export default Header;