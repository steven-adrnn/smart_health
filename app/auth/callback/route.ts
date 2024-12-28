// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
  }

  // Redirect ke URL environment
  return NextResponse.redirect(new URL(process.env.NEXT_PUBLIC_SITE_URL || '/'));
}