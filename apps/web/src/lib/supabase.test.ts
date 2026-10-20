import { afterEach, describe, expect, it, vi } from 'vitest'
import { supabase } from './supabase'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('cliente REST de Supabase', () => {
  afterEach(() => {
    fetchMock.mockReset()
  })

  it('llama a la RPC por POST con la anon key y devuelve los datos', async () => {
    fetchMock.mockResolvedValue(json(['2030-05-20T08:00:00+00:00']))

    const result = await supabase.rpc<string[]>('get_available_slots', { p_date: '2030-05-20' })

    expect(result).toEqual({ data: ['2030-05-20T08:00:00+00:00'], error: null })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/rest\/v1\/rpc\/get_available_slots$/)
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify({ p_date: '2030-05-20' }))
    expect(init.headers.apikey).toBeTruthy()
    expect(init.headers.Authorization).toBe(`Bearer ${init.headers.apikey}`)
  })

  it('lee una tabla con los filtros de PostgREST', async () => {
    fetchMock.mockResolvedValue(json([{ id: 'f1' }]))

    const result = await supabase.select('treatments', 'select=*&is_active=eq.true')

    expect(result.data).toEqual([{ id: 'f1' }])
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/rest\/v1\/treatments\?select=\*&is_active=eq\.true$/)
  })

  it('devuelve el mensaje de PostgREST cuando la función SQL lanza un error', async () => {
    fetchMock.mockResolvedValue(
      json({ code: 'P0001', message: 'Ese hueco ya no está disponible, elige otro.', details: null, hint: null }, 400),
    )

    const result = await supabase.rpc('submit_booking', {})

    expect(result).toEqual({
      data: null,
      error: { code: 'P0001', message: 'Ese hueco ya no está disponible, elige otro.' },
    })
  })

  it('convierte un fallo de red en error, sin lanzar', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await supabase.rpc('submit_booking', {})

    expect(result.data).toBeNull()
    expect(result.error?.message).toContain('Failed to fetch')
  })
})
