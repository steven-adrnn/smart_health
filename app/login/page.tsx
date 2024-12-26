'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import * as bcrypt from 'bcryptjs';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            // Log input untuk debugging
            console.log('Login Attempt:', { email, password });

            // Cek user di tabel custom
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            console.log('User Data:', userData);
            console.log('User Error:', userError);

            if (userError || !userData) {
                toast.error('Email tidak terdaftar');
                return;
            }

            // Verifikasi password
            const isPasswordCorrect = await bcrypt.compare(
                password, 
                userData.password || ''
            );

            console.log('Password Check:', isPasswordCorrect);

            if (!isPasswordCorrect) {
                toast.error('Password salah');
                return;
            }

            // Login via Supabase Auth dengan log tambahan
            try {
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                console.log('Auth Data:', data);
                console.log('Auth Error:', authError);

                if (authError) {
                    throw authError;
                }

                // Redirect setelah login berhasil
                toast.success('Login berhasil!');
                router.push('/dashboard');

            } catch (authSpecificError) {
                console.error('Authentication Specific Error:', authSpecificError);
                toast.error('Gagal mengautentikasi: ' + 
                    (authSpecificError instanceof Error ? authSpecificError.message : 'Unknown error')
                );
            }

        } catch (error) {
            console.error('Login Error:', error);
            toast.error('Terjadi kesalahan saat login');
        }
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
}