import { NextResponse, NextRequest } from 'next/server'
import { locales } from 'app/[locale]/i18n/settings'
import { fallbackLng } from 'app/[locale]/i18n/locales'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  // Configuration CORS pour les API routes
  if (pathname.startsWith('/api/')) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // En production, limitez aux domaines autorisés
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: corsHeaders })
    }

    return response
  }

  // Check if the default locale is in the pathname
  if (pathname.startsWith(`/${fallbackLng}/`) || pathname === `/${fallbackLng}`) {
    // e.g. incoming request is /en/about
    // The new URL is now /about
    return NextResponse.redirect(
      new URL(
        pathname.replace(`/${fallbackLng}`, pathname === `/${fallbackLng}` ? '/' : ''),
        request.url
      )
    )
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    // We are on the default locale
    // Rewrite so Next.js understands

    // e.g. incoming request is /about
    // Tell Next.js it should pretend it's /en/about
    return NextResponse.rewrite(new URL(`/${fallbackLng}${pathname}`, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!static|track|data|css|scripts|.*\\..*|_next).*|sitemap.xml)',
    '/api/:path*' // Inclure les routes API pour CORS
  ],
}
