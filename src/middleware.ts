import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rutas protegidas por rol
    if (path.startsWith('/admin') && token?.role !== 'Administrador') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (path.startsWith('/empleado') && token?.role !== 'Empleado') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (path.startsWith('/usuario') && token?.role !== 'Usuario') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/empleado/:path*', '/usuario/:path*']
}; 