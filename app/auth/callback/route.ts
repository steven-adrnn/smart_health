import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code:', error);
      return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }
  }

  // Redirect to the homepage or dashboard after successful login
  return NextResponse.redirect(new URL('/', request.url))
}