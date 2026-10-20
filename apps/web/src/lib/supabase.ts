// Cliente mínimo de la API REST de Supabase (PostgREST). La web pública solo
// lee tratamientos y llama a dos RPC (get_available_slots, submit_booking), así
// que no carga @supabase/supabase-js, que incluye auth, realtime y storage y
// era ~20 % del JS. Devuelve { data, error } como supabase-js.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export interface SupabaseError {
  message: string
  code?: string
}

export interface SupabaseResult<T> {
  data: T | null
  error: SupabaseError | null
}

const request = async <T>(path: string, init?: RequestInit): Promise<SupabaseResult<T>> => {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
    const body = res.status === 204 ? null : await res.json().catch(() => null)
    if (!res.ok) {
      // PostgREST devuelve { code, message, details, hint }; `message` es el
      // texto del `raise exception` de las funciones SQL.
      return { data: null, error: { message: body?.message ?? res.statusText, code: body?.code } }
    }
    return { data: body as T, error: null }
  } catch (err) {
    // Sin red o con Supabase pausado, fetch lanza en vez de responder.
    return { data: null, error: { message: String(err) } }
  }
}

export const supabase = {
  /** POST /rest/v1/rpc/<fn>: llama a una función SQL expuesta a anon. */
  rpc: <T>(fn: string, args: Record<string, unknown>) =>
    request<T>(`rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) }),

  /** GET /rest/v1/<table>?<query>, con la sintaxis de filtros de PostgREST. */
  select: <T>(table: string, query: string) => request<T>(`${table}?${query}`),
}
