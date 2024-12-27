'use client'

import { useState, useEffect } from "react";
import { supabase, getUserSession } from "@/lib/supabaseClient";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const currentSession = await getUserSession();
      setSession(currentSession);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}