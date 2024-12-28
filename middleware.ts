// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  if (session?.user) {
    // Pastikan user ada di tabel users
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // Insert user jika tidak ada
      await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || 'Google User',
          password: crypto.randomUUID(),
          point: 0
        })
    }
  }

  return res
}