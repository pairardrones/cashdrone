import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isUserPro } from '@/lib/subscription'

const PRO_ROUTES = [
  '/dashboard/clientes',
  '/dashboard/marketplace',
  '/dashboard/aro-sora',
  '/dashboard/meteorologia',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Só aplica nas rotas Pro
  const isProRoute = PRO_ROUTES.some((route) => pathname.startsWith(route))
  if (!isProRoute) return NextResponse.next()

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  const pro = await isUserPro(user.id)
  if (!pro) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/assinatura'
    url.searchParams.set('upgrade', '1')
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}