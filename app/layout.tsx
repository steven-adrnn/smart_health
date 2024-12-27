'use client'

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Smart Health",
  description: "Aplikasi kesehatan pintar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Fungsi untuk mengelola token sesi
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Simpan token ke localStorage
        localStorage.setItem('sb-access-token', session.access_token || '');
        localStorage.setItem('sb-refresh-token', session.refresh_token || '');
      } else if (event === 'SIGNED_OUT') {
        // Hapus token dari localStorage
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
      }
    });

    // Cek token saat load
    const accessToken = localStorage.getItem('sb-access-token');
    const refreshToken = localStorage.getItem('sb-refresh-token');

    if (accessToken && refreshToken) {
      // Refresh sesi jika token tersedia
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }

    // Pembersihan listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster /> {/* Tambahkan ini untuk notifikasi */}
      </body>
    </html>
  );
}