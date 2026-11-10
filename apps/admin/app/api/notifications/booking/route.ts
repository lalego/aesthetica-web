import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'node:crypto'

export const runtime = 'nodejs'

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

export async function POST(request: Request) {
  const secret = process.env.BOOKING_NOTIFICATION_SECRET
  const signature = request.headers.get('x-booking-signature')
  const timestamp = request.headers.get('x-booking-timestamp')
  const timestampSeconds = Number(timestamp)
  if (!secret || !signature || !Number.isInteger(timestampSeconds) ||
      Math.abs(Date.now() / 1000 - timestampSeconds) > 300) {
    return json({ error: 'Unauthorized' }, 401)
  }

  let appointmentId: string
  try {
    const body: unknown = await request.json()
    appointmentId = (body as { appointment_id?: string }).appointment_id ?? ''
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(appointmentId)) {
    return json({ error: 'Invalid appointment_id' }, 400)
  }
  const expected = createHmac('sha256', secret).update(`${timestamp}.${appointmentId}`).digest()
  let supplied: Buffer
  try {
    supplied = Buffer.from(signature, 'hex')
  } catch {
    return json({ error: 'Unauthorized' }, 401)
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const recipient = process.env.BOOKING_NOTIFICATION_EMAIL
  if (!supabaseUrl || !serviceRoleKey || !recipient) {
    console.error('[booking-notification] Missing Supabase or recipient configuration')
    return json({ error: 'Notification service is not configured' }, 503)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase
    .from('appointments')
    .select('id, scheduled_at, patients(full_name, email, phone), treatments(name)')
    .eq('id', appointmentId)
    .single()

  if (error || !data) {
    console.error('[booking-notification] Could not load appointment', error?.message)
    return json({ error: 'Appointment not found' }, 404)
  }

  const patient = Array.isArray(data.patients) ? data.patients[0] : data.patients
  const treatment = Array.isArray(data.treatments) ? data.treatments[0] : data.treatments
  if (!patient || !treatment) return json({ error: 'Appointment details are incomplete' }, 422)

  const date = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Madrid',
  }).format(new Date(data.scheduled_at))
  const message = [
    'Nueva solicitud de cita — Estudio AestheticA',
    `Cliente: ${patient.full_name}`,
    `Tratamiento: ${treatment.name}`,
    `Fecha: ${date}`,
    `Teléfono: ${patient.phone ?? 'No indicado'}`,
    `Email: ${patient.email ?? 'No indicado'}`,
  ].join('\n')

  const outcomes = await Promise.allSettled([
    sendEmail(message, patient.full_name, recipient),
    sendWhatsApp(patient.full_name, treatment.name, date, patient.phone ?? ''),
  ])
  const failed = outcomes.filter((result) => result.status === 'rejected')
  if (failed.length) {
    console.error('[booking-notification] Provider delivery failed', failed.length)
    return json({ error: 'One or more notification providers failed' }, 502)
  }
  return json({ ok: true })
}

async function sendEmail(message: string, patientName: string, recipient: string) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.BOOKING_NOTIFICATION_FROM
  if (!apiKey || !from) throw new Error('Resend is not configured')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: `Nueva solicitud de cita: ${patientName}`,
      text: message,
    }),
  })
  if (!response.ok) throw new Error(`Resend returned ${response.status}`)
}

async function sendWhatsApp(patientName: string, treatmentName: string, date: string, phone: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const recipient = process.env.WHATSAPP_OWNER_PHONE
  const templateName = process.env.WHATSAPP_BOOKING_TEMPLATE
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? 'es_ES'
  const version = process.env.WHATSAPP_GRAPH_API_VERSION
  if (!token || !phoneNumberId || !recipient || !templateName || !version) {
    throw new Error('WhatsApp is not configured')
  }

  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [{
          type: 'body',
          parameters: [patientName, treatmentName, date, phone || 'No indicado']
            .map((text) => ({ type: 'text', text })),
        }],
      },
    }),
  })
  if (!response.ok) throw new Error(`WhatsApp returned ${response.status}`)
}
