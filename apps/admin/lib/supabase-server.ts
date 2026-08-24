import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Cliente con anon key + cookies, para Server Components/Actions.
// Solo se usa para saber "quién está logueado" (auth.getClaims()); las
// lecturas/escrituras de datos siguen yendo por supabase-admin.ts.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Un Server Component no puede escribir cookies — proxy.ts se
          // encarga de refrescar la sesión en cada request.
        }
      },
    },
  })
}
