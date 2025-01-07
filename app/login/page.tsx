'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Chrome as GoogleIcon } from 'lucide-react';
import { motion } from 'framer-motion';



export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            // Simpan data sesi di localStorage
            if (data.session) {
                localStorage.setItem('user_session', JSON.stringify(data.session));
            }

            toast.success('Login berhasil!');
            router.push('/');
        } catch (error) {
            console.error('Login Error:', error);
            toast.error('Terjadi kesalahan saat login');
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: '${window.location.origin}/auth/callback',
                    scopes: 'openid email profile'
                }
            });

            console.log('OAuth Data:', data);
            console.log('OAuth Error:', error);

            if (data?.url) {
                console.log('Redirecting to:', data.url);
                window.location.href = data.url;
            }

            if (error) {
                console.error('Google Sign In Error:', error);
                toast.error('Gagal login dengan Google');
                return;
            }
        } catch (error) {
            console.error('Unexpected Google Sign In Error:', error);
            toast.error('Terjadi kesalahan saat login dengan Google');
        }
    };

    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto flex justify-center items-center h-screen"
        >
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-bold text-primary mb-4">Login</h2>
            <form onSubmit={handleLogin}>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="mb-4"
              />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="mb-4"
              />
              
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="mt-4">
                    <Button 
                        onClick={handleGoogleSignIn} 
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                    >
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        Login dengan Google
                    </Button>
                </div>
                <div className="text-center">
                    <p>Belum punya akun? 
                        <Link href="/register" className="text-blue-500 ml-1">
                            Daftar
                        </Link>
                    </p>
                </div>
            </form>
          </div>
        </motion.div>
      );
}