'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

// Página raíz: no requiere sesión previa porque también es donde aterriza
// el enlace de invitación de Supabase (token consumido del fragmento #,
// que solo el navegador puede leer). Decide a dónde mandar al usuario:
// - viene de una invitación → /set-password
// - ya tiene sesión → /citas
// - nada de lo anterior → /login
export function AuthDispatcher() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const isInviteHash = window.location.hash.includes('type=invite')

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && isInviteHash) {
        router.replace('/set-password')
      } else if (session) {
        router.replace('/citas')
      }
    })

    if (!window.location.hash) {
      supabase.auth.getSession().then(({ data }) => {
        router.replace(data.session ? '/citas' : '/login')
      })
    }

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
