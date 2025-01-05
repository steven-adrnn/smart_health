import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from './lib/database.types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Validasi Sesi dan Koneksi
  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Log Koneksi Realtime
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Realtime Connection Test Failed:', error);
      // Opsional: Kirim notifikasi atau log tambahan
    }

    if (session?.user) {
      // Existing user validation logic
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
  } catch (catchError) {
    console.error('Middleware Connection Error:', catchError);
  }

  return res
}