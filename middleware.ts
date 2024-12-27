// middleware.ts (buat file baru di root project)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path === '/register'

  const token = request.cookies.get('sb-access-token')?.value || ''

  if(isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const protectedPaths = ['/shop', '/cart', '/checkout', '/profile', '/dashboard']
  if (protectedPaths.includes(path) && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/shop',
    '/cart',
    '/checkout',
    '/profile',
    '/dashboard'
  ]
}