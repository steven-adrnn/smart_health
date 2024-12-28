'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import * as bcrypt from 'bcryptjs';  // Install bcryptjs
import { Button } from '@/components/ui/button';
import { Chrome as GoogleIcon } from 'lucide-react';


export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validasi Input
        if (!email || !password || !name) {
            toast.error('Harap isi semua field');
            return;
        }

        try {
            // Hash Password (PENTING!)
            const hashedPassword = await bcrypt.hash(password, 10);

            // Registrasi Autentikasi Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { 
                        name,
                        registeredAt: new Date().toISOString()
                    }
                }
            });
            
            // Tangani Error Autentikasi
            if (authError) {
                throw authError;
            }

            // Pastikan User Terbuat
            if (!authData.user) {
                throw new Error('Gagal membuat user');
            }

            // Insert Data ke Tabel Users dengan Password Terenkripsi
            const { error: userError } = await supabase
                .from('users')
                .upsert({
                    id: authData.user.id,
                    email: authData.user.email || email,
                    name: name,
                    password: hashedPassword,  // Simpan password terenkripsi
                    created_at: new Date().toISOString()
                })
                .select();

            // Tangani Error Insert
            if (userError) {
                throw userError;
            }

            toast.success('Registrasi Berhasil!');
            router.push('/login');

        } catch (error) {
            console.error('Registration Error:', error);
            
            // Error Handling Spesifik
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `https://smart-health-tst-production.up.railway.app/auth/callback`
                }
            });

            if (data?.url) {
                window.location.href = data.url;
            }

            if (error) {
                toast.error('Google Sign Up Error: ' + error.message);
                return;
            }
        } catch (error) {
            console.error('Unexpected Google Sign Up Error:', error);
            toast.error('Terjadi kesalahan saat mendaftar dengan Google');
        }
    };

    return (
        <div>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Daftar</button>
                <div className="mt-4">
                    <Button 
                        onClick={handleGoogleSignUp} 
                        variant="outline" 
                        className="w-full flex items-center justify-center"
                    >
                        <GoogleIcon className="mr-2 h-5 w-5" />
                        Daftar dengan Google
                    </Button>
                </div>
            </form>
        </div>
    );
}