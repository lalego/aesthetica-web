import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isSlotTakenError, submitBooking, type BookingFormData } from './bookingService'

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc },
}))

const booking: BookingFormData = {
  name: 'Test Patient',
  email: 'booking@example.test',
  phone: '+34 600 000 000',
  treatment_id: 'f1',
  preferred_date: '2030-05-20',
  scheduled_at: '2030-05-20T08:00:00.000Z',
  notes: '',
  gdpr_consent: true,
}

describe('submitBooking', () => {
  beforeEach(() => {
    rpc.mockReset()
  })

  it('envía los campos del formulario a la RPC transaccional', async () => {
    rpc.mockResolvedValue({ error: null })

    await expect(submitBooking(booking)).resolves.toBeUndefined()

    expect(rpc).toHaveBeenCalledWith('submit_booking', {
      p_name: booking.name,
      p_email: booking.email,
      p_phone: booking.phone,
      p_treatment_id: booking.treatment_id,
      p_scheduled_at: booking.scheduled_at,
      p_notes: booking.notes,
      p_gdpr_consent: true,
    })
  })

  it('propaga errores de disponibilidad o de la RPC', async () => {
    const error = new Error('Ese hueco ya no está disponible')
    rpc.mockResolvedValue({ error })

    await expect(submitBooking(booking)).rejects.toBe(error)
  })
})

describe('isSlotTakenError', () => {
  it('reconoce el error de hueco ocupado de submit_booking()', () => {
    // Forma en que llega el error de PostgREST (ver lib/supabase.ts).
    expect(isSlotTakenError({ message: 'Ese hueco ya no está disponible, elige otro.', code: 'P0001' })).toBe(true)
  })

  it('no confunde otros errores con un hueco ocupado', () => {
    expect(isSlotTakenError(new TypeError('Failed to fetch'))).toBe(false)
    expect(isSlotTakenError({ message: 'treatment_id inválido o inactivo: x' })).toBe(false)
    expect(isSlotTakenError(null)).toBe(false)
  })
})
