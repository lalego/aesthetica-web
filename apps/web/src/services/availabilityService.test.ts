import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAvailableSlots } from './availabilityService'

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc },
}))

describe('fetchAvailableSlots', () => {
  beforeEach(() => {
    rpc.mockReset()
  })

  it('consulta la RPC con fecha y tratamiento y devuelve los huecos', async () => {
    const slots = ['2030-05-20T08:00:00.000Z']
    rpc.mockResolvedValue({ data: slots, error: null })

    await expect(fetchAvailableSlots('2030-05-20', 'f1')).resolves.toEqual(slots)
    expect(rpc).toHaveBeenCalledWith('get_available_slots', {
      p_date: '2030-05-20',
      p_treatment_id: 'f1',
    })
  })

  it('devuelve una lista vacía si la consulta falla', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    rpc.mockResolvedValue({ data: null, error: { message: 'offline' } })

    await expect(fetchAvailableSlots('2030-05-20', 'f1')).resolves.toEqual([])
    expect(warning).toHaveBeenCalledOnce()
    warning.mockRestore()
  })
})
