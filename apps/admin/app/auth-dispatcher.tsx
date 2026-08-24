'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

// Página raíz: no requiere sesión previa porque también es donde aterriza
// el enlace de invitación de Supabase (token en el fragmento #, que solo
// el navegador puede leer). @supabase/ssr fuerza flowType: 'pkce' tanto en
// el cliente de navegador como en el de servidor (no se puede desactivar),
// así que su detección automática de sesión busca un ?code= en la URL —
// nunca el #access_token=...&type=invite que produce el enlace de
// invitación por defecto de Supabase (plan Free, sin SMTP propio para
// personalizar la plantilla con un token_hash). Por eso hay que leer el
// fragmento a mano y llamar a setSession() explícitamente.
// Decide a dónde mandar al usuario:
// - viene de una invitación/recuperación → /set-password
// - ya tiene sesión → /citas
// - nada de lo anterior → /login
export function AuthDispatcher() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function dispatch() {
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (!error) {
          router.replace(type === 'invite' || type === 'recovery' ? '/set-password' : '/citas')
          return
        }
      }

      const { data } = await supabase.auth.getSession()
      router.replace(data.session ? '/citas' : '/login')
    }

    dispatch()
  }, [router])

  return null
}
