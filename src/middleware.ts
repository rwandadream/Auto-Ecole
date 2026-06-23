import { type NextRequest, NextResponse } from 'next/server'

/**
 * CSRF guard for state-mutating API routes.
 *
 * Supabase sets cookies with SameSite=Lax, so most CSRF vectors are already
 * blocked by the browser.  This Origin-vs-Host check is defense-in-depth:
 * if a third-party page tries to POST/PATCH/DELETE against /api/admin/*, the
 * Origin header will differ from the Host and the request is rejected.
 *
 * Session refresh (keeping the admin JWT alive) is handled by
 * store-hydration.tsx → restoreSupabaseSession(), not here, because
 * @supabase/ssr pulls Node.js-only modules incompatible with the Edge runtime.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PATCH', 'DELETE', 'PUT'].includes(request.method)
  ) {
    const originHeader = request.headers.get('origin')
    const hostHeader = request.headers.get('host') ?? ''

    if (originHeader) {
      const allowed = [`http://${hostHeader}`, `https://${hostHeader}`]
      if (!allowed.includes(originHeader)) {
        return NextResponse.json(
          { error: 'Requête non autorisée (CSRF)' },
          { status: 403 },
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
