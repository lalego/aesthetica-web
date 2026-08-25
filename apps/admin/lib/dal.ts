import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from './supabase-server'

// Comprobación "segura" (verifica el JWT) para usar en Server Components y
// Server Actions. proxy.ts ya hace una comprobación optimista antes de que
// esto se ejecute, pero las Server Actions son endpoints públicos igual que
// una API route — hay que volver a comprobar aquí, no basta con proteger la página.
export const verifySession = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect('/login')
  }

  return {
    userId: data.claims.sub as string,
    email: data.claims.email as string,
  }
})
