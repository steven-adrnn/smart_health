'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import * as bcrypt from 'bcryptjs';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Cooldown mechanism
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (cooldown > 0) {
            timer = setTimeout(() => {
                setCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    // Fungsi kirim ulang email konfirmasi dengan rate limiting
    const resendConfirmationEmail = async () => {
        // Cek apakah masih dalam cooldown
        if (cooldown > 0) {
            toast.error(`Silakan tunggu ${cooldown} detik sebelum mencoba lagi`);
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) {
                // Handle specific error messages
                switch (error.message) {
                    case 'For security purposes, you can only request this after 50 seconds':
                        toast.error('Silakan tunggu 50 detik sebelum meminta ulang');
                        setCooldown(50);
                        break;
                    default:
                        toast.error(error.message);
                }
            } else {
                toast.success('Email konfirmasi telah dikirim ulang');
                // Set cooldown untuk mencegah spam
                setCooldown(60);
            }
        } catch (error) {
            console.error('Error resending confirmation email:', error);
            toast.error('Gagal mengirim ulang email konfirmasi');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Cek apakah masih dalam cooldown
        if (cooldown > 0) {
            toast.error(`Silakan tunggu ${cooldown} detik sebelum login`);
            return;
        }

        setIsLoading(true);
        
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
                // Implementasi sederhana anti-brute force
                setCooldown(30);  // Block 30 detik setelah password salah
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
                        toast.error('Email belum dikonfirmasi.');
                        // Tambahkan opsi kirim ulang konfirmasi
                        setCooldown(30);
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Masukkan email"
                        required
                        disabled={isLoading || cooldown > 0}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        required
                        disabled={isLoading || cooldown > 0}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading || cooldown > 0}
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    {isLoading ? 'Memproses...' : 
                     cooldown > 0 ? `Tunggu ${cooldown}s` : 
                     'Login'}
                </button>
            </form>

            {/* Tombol Kirim Ulang Konfirmasi */}
            <div className="mt-4 text-center">
                <button 
                    onClick={resendConfirmationEmail}
                    disabled={isLoading || cooldown > 0}
                    className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                    {cooldown > 0 
                        ? `Kirim Ulang (${cooldown}s)` 
                        : 'Kirim Ulang Email Konfirmasi'}
                </button>
            </div>

            {/* Link Registrasi */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Belum punya akun? {' '}
                    <a 
                        href="/register" 
                        className="text-indigo-600 hover:text-indigo-500"
                    >
                        Daftar sekarang
                    </a>
                </p>
            </div>
        </div>
    );
}