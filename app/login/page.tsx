// app/login/page.tsx
'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const resendConfirmationEmail = async (email: string) => {
      const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email
      });
  
      if (error) {
          console.error('Error resending confirmation email:', error);
          toast.error('Gagal mengirim ulang email konfirmasi');
      } else {
          toast.success('Email konfirmasi telah dikirim ulang');
      }
    };
    
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            console.log('Login data:', data);

            if (error) {
              console.error('Login Error:', error);
              if (error.message === 'Email not confirmed') {
                  // Kirim ulang email konfirmasi
                  await resendConfirmationEmail(email);
                  toast.error('Email belum dikonfirmasi. Cek email untuk konfirmasi.');
              } else {
                  toast.error(error.message);
              }
              return;
          }

            // Redirect setelah login berhasil
            toast.success('Login berhasil!');
            router.push('/dashboard');

        } catch (error) {
            console.error('Unexpected Login Error:', error);
            toast.error('Terjadi kesalahan saat login');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                    Login
                </button>
            </form>
        </div>
    );
}