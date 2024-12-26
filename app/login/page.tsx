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
            // Cek user di tabel custom
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (userError || !userData) {
                toast.error('Email tidak terdaftar');
                return;
            }

            // Verifikasi password
            const isPasswordCorrect = await bcrypt.compare(
                password, 
                userData.password || ''
            );

            if (!isPasswordCorrect) {
                toast.error('Password salah');
                return;
            }

            // Login via Supabase Auth
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                // Handle specific auth errors
                switch (authError.message) {
                    case 'Email not confirmed':
                        // Kirim ulang email konfirmasi
                        await resendConfirmationEmail(email);
                        toast.error('Email belum dikonfirmasi. Cek email untuk konfirmasi.');
                        break;
                    default:
                        toast.error(authError.message);
                }
                return;
            }

            // Redirect setelah login berhasil
            toast.success('Login berhasil!');
            router.push('/dashboard');

        } catch (error) {
            console.error('Login Error:', error);
            toast.error('Terjadi kesalahan saat login');
        }
    };

    // Fungsi kirim ulang email konfirmasi
    const resendConfirmationEmail = async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        });

        if (error) {
            console.error('Error resending confirmation email:', error);
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
            <button onClick={() => resendConfirmationEmail(email)}>
                Kirim Ulang Email Konfirmasi
            </button>
        </div>
    );
}