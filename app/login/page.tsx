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

    const handleResendConfirmation = async () => {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) {
                toast.error('Gagal mengirim ulang email konfirmasi: ' + error.message);
            } else {
                toast.success('Email konfirmasi telah dikirim ulang');
            }
        } catch (error) {
            console.error('Resend Confirmation Error:', error);
            toast.error('Terjadi kesalahan saat mengirim ulang email');
        }
    };

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

            // Tambahan: Verifikasi manual di Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.getUser(userData.id);

            if (authError) {
                toast.error('Gagal mendapatkan informasi pengguna: ' + authError.message);
                return;
            }

            console.log(authData);

            // Login dengan metode alternatif
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                // Handle spesifik error email tidak terkonfirmasi
                if (signInError.message === 'Email not confirmed') {
                    toast.error('Email belum dikonfirmasi');
                    
                    // Tampilkan dialog konfirmasi
                    const confirmResend = window.confirm(
                        'Email Anda belum dikonfirmasi. Kirim ulang email konfirmasi?'
                    );

                    if (confirmResend) {
                        await handleResendConfirmation();
                    }
                    return;
                }

                // Error lainnya
                toast.error('Login gagal: ' + signInError.message);
                return;
            }

            console.log(signInData);

            // Redirect setelah login berhasil
            toast.success('Login berhasil!');
            router.push('/dashboard');

        } catch (error) {
            console.error('Login Error:', error);
            toast.error('Terjadi kesalahan saat login');
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <button 
                    type="submit" 
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Login
                </button>
            </form>

            {/* Tombol Kirim Ulang Konfirmasi */}
            <div className="mt-4 text-center">
                <button 
                    onClick={handleResendConfirmation}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                    Kirim Ulang Email Konfirmasi
                </button>
            </div>
        </div>
    );
}