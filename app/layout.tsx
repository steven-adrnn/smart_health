'use client'

import { useState, useEffect } from "react";
import { supabase, setupRealtimeReconnect, monitorRealtimeConnection } from "@/lib/supabaseClient";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Session } from "@supabase/supabase-js";
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
    // Setup Realtime Reconnect
    setupRealtimeReconnect();
    monitorRealtimeConnection();


    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );


    // Error Handling Global
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); 
  
  return (
    <html lang="en">
      <body>
        <Header session={session} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}