// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth Exchange Error:', error);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    // Ambil sesi setelah login
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      // Cek apakah user sudah ada di tabel users
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Gunakan existingUser jika diperlukan, misalnya logging
      console.log('Existing User:', existingUser);

      if (userError && userError.code === 'PGRST116') {
        // User belum ada di tabel users, insert manual
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || 'Google User',
            password: crypto.randomUUID(), // Generate random password
            point: 0
          });

        if (insertError) {
          console.error('Error inserting user:', insertError);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(process.env.NEXT_PUBLIC_SITE_URL || '/'));
}