// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('sb-access-token')?.value || '';
    const isLoginPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register';
    const isProtectedPath = ['/shop', '/cart', '/checkout', '/profile', '/dashboard'].includes(request.nextUrl.pathname);

    if (isProtectedPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isLoginPage && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }
}

export const config = {
    matcher: ['/shop', '/cart', '/checkout', '/profile', '/dashboard', '/login', '/register'],
};