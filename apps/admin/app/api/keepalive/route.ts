import { createClient } from '@supabase/supabase-js'

// Lo llama a diario el Cron Job de Vercel (vercel.json). El plan Free de
// Supabase pausa el proyecto tras ~7 días sin actividad, y entonces la web
// deja de recibir reservas. Una consulta mínima basta para mantenerlo activo.
//
// Usa la anon key y lee lo mismo que la web pública (tratamientos activos),
// así que no expone nada aunque se llame desde fuera. Si existe CRON_SECRET
// en Vercel, solo responde a las llamadas del cron, que envían esa cabecera.
// Está excluida de proxy.ts para que no redirija a /login.

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  })
  const { error } = await supabase.from('treatments').select('id').limit(1)

  if (error) {
    // Un 500 aparece en Vercel → Logs, y así se ve si el proyecto se ha pausado.
    console.error('[keepalive]', error.message)
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
  return Response.json({ ok: true, at: new Date().toISOString() })
}
