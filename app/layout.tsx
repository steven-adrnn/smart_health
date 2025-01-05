'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Session } from "@supabase/supabase-js";
import { NotificationSystem } from '@/components/NotificationSystem';
import Header from "@/components/Header"; // Pastikan Anda sudah membuat komponen Header

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Hapus setSession dari dependency array

  return (
    <html lang="en">
      <body>
        <Header session={session} />
        <NotificationSystem />
        {children}
        <Toaster />
      </body>
    </html>
  );
}