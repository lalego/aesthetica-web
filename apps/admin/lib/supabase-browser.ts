'use client'

import { createBrowserClient } from '@supabase/ssr'

// Cliente de navegador, solo para consumir el fragmento #access_token=...
// que Supabase añade al redirigir tras verificar un enlace de invitación
// (la plantilla de email por defecto no se puede personalizar sin SMTP
// propio, así que no podemos usar un token_hash server-side). Sincroniza
// la sesión en cookies (vía @supabase/ssr) para que el resto de la app
// (proxy.ts, Server Actions) la vea igual que si hubiera hecho login normal.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
