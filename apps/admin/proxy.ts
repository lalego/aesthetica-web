import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// En Next.js 16 "Middleware" pasa a llamarse Proxy (mismo comportamiento).
// Comprobación optimista: refresca la sesión de Supabase en cada request y
// redirige según haya o no un usuario logueado. Server Actions y Server
// Components vuelven a comprobar la sesión por su cuenta (ver lib/dal.ts) —
// esto solo evita que se llegue a renderizar el dashboard sin sesión.

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims
  const pathname = request.nextUrl.pathname
  const isLoginPath = pathname === '/login'
  // '/' también hace de landing para el enlace de invitación de Supabase:
  // los tokens llegan en el fragmento #, que el servidor nunca ve, así que
  // no puede exigirse sesión aquí — AuthDispatcher (cliente) decide a dónde
  // mandar al usuario una vez consumido. /set-password sí llega ya
  // autenticado (la sesión ya se sincronizó en cookies) y no necesita esto.
  const isPublicPath = isLoginPath || pathname === '/'

  if (!isAuthenticated && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isAuthenticated && isLoginPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/citas'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
