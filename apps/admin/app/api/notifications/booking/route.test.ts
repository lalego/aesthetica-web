import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mocks.createClient,
}))

const secret = 'test-booking-notification-secret'
const appointmentId = '123e4567-e89b-42d3-a456-426614174000'
const appointment = {
  id: appointmentId,
  scheduled_at: '2026-11-20T10:30:00.000Z',
  patients: { full_name: 'Ana Pérez', email: 'ana@example.test', phone: '600123456' },
  treatments: { name: 'Limpieza facial' },
}

const signedRequest = (timestamp = Math.floor(Date.now() / 1000).toString()) => {
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${appointmentId}`)
    .digest('hex')

  return new Request('https://admin.example.test/api/notifications/booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Booking-Timestamp': timestamp,
      'X-Booking-Signature': signature,
    },
    body: JSON.stringify({ appointment_id: appointmentId }),
  })
}

const responseJson = (status = 200) => new Response(null, { status })

describe('POST /api/notifications/booking', () => {
  beforeEach(() => {
    vi.stubEnv('BOOKING_NOTIFICATION_SECRET', secret)
    vi.stubEnv('SUPABASE_URL', 'https://supabase.example.test')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-test-key')
    vi.stubEnv('BOOKING_NOTIFICATION_EMAIL', 'owner@example.test')
    vi.stubEnv('BOOKING_NOTIFICATION_FROM', 'Studio <bookings@example.test>')
    vi.stubEnv('RESEND_API_KEY', 'resend-test-key')
    vi.stubEnv('WHATSAPP_ACCESS_TOKEN', 'whatsapp-test-token')
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', 'phone-number-test-id')
    vi.stubEnv('WHATSAPP_OWNER_PHONE', '+34 600 000 000')
    vi.stubEnv('WHATSAPP_BOOKING_TEMPLATE', 'new_booking')
    vi.stubEnv('WHATSAPP_TEMPLATE_LANGUAGE', 'es_ES')
    vi.stubEnv('WHATSAPP_GRAPH_API_VERSION', 'v99.0')

    mocks.createClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: appointment, error: null }),
          })),
        })),
      })),
    })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseJson()))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('rechaza una petición sin firma válida antes de consultar Supabase', async () => {
    const request = signedRequest()
    const headers = new Headers(request.headers)
    headers.set('X-Booking-Signature', '00'.repeat(32))
    const tamperedRequest = new Request(request, { headers })

    const response = await POST(tamperedRequest)

    expect(response.status).toBe(401)
    expect(mocks.createClient).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rechaza firmas con más de cinco minutos de antigüedad', async () => {
    const staleTimestamp = (Math.floor(Date.now() / 1000) - 301).toString()

    const response = await POST(signedRequest(staleTimestamp))

    expect(response.status).toBe(401)
    expect(mocks.createClient).not.toHaveBeenCalled()
  })

  it('envía email y WhatsApp con los datos de la cita para una firma válida', async () => {
    const response = await POST(signedRequest())

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(mocks.createClient).toHaveBeenCalledWith(
      'https://supabase.example.test',
      'service-role-test-key',
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
    expect(fetch).toHaveBeenCalledTimes(2)

    const calls = vi.mocked(fetch).mock.calls
    const emailCall = calls.find(([url]) => url === 'https://api.resend.com/emails')
    expect(emailCall).toBeDefined()
    expect(JSON.parse(String(emailCall?.[1]?.body))).toMatchObject({
      to: ['owner@example.test'],
      subject: 'Nueva solicitud de cita: Ana Pérez',
      text: expect.stringContaining('Tratamiento: Limpieza facial'),
    })

    const whatsappCall = calls.find(([url]) => String(url).includes('graph.facebook.com'))
    expect(whatsappCall).toBeDefined()
    expect(JSON.parse(String(whatsappCall?.[1]?.body))).toMatchObject({
      messaging_product: 'whatsapp',
      to: '34600000000',
      type: 'template',
      template: {
        name: 'new_booking',
        language: { code: 'es_ES' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: 'Ana Pérez' },
            { type: 'text', text: 'Limpieza facial' },
            { type: 'text', text: expect.stringContaining('viernes') },
            { type: 'text', text: '600123456' },
          ],
        }],
      },
    })
  })

  it('devuelve error de proveedor si falla uno de los envíos', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(responseJson(500)).mockResolvedValueOnce(responseJson())

    const response = await POST(signedRequest())

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: 'One or more notification providers failed',
    })
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('responde 503 si falta configuración del servicio', async () => {
    vi.stubEnv('BOOKING_NOTIFICATION_EMAIL', '')

    const response = await POST(signedRequest())

    expect(response.status).toBe(503)
    expect(fetch).not.toHaveBeenCalled()
  })
})
