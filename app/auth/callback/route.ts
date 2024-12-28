// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('Full Callback URL:', requestUrl.toString());
  console.log('Extracted Code:', code);

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth Exchange Error:', error);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  // Redirect to home page after successful login
  return NextResponse.redirect(new URL('/', request.url));
}