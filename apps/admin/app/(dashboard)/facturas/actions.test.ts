import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInvoice, type InvoiceInput } from './actions'

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  rpc: vi.fn(),
  verifySession: vi.fn(),
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: mocks.from,
    rpc: mocks.rpc,
  },
}))
vi.mock('@/lib/dal', () => ({
  verifySession: mocks.verifySession,
}))
vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}))

const input: InvoiceInput = {
  series: 'F',
  issued_on: '2030-05-20',
  patient_id: 'patient-test-id',
  appointment_id: null,
  customer_name: ' Test Customer ',
  customer_tax_id: ' x123 ',
  customer_address: ' Test Street ',
  customer_postal_code: '',
  payment_method: '',
  observations: '',
  items: [{ description: ' Facial ', amount: 100, treatment_id: 'f1' }],
}

describe('createInvoice server action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.verifySession.mockResolvedValue({ userId: 'staff-id', email: 'staff@example.test' })
    mocks.from.mockReturnValue({ update: mocks.update })
    mocks.update.mockReturnValue({ eq: mocks.eq })
    mocks.eq.mockResolvedValue({ error: null })
    mocks.rpc.mockResolvedValue({ data: 'invoice-test-id', error: null })
  })

  it('requiere una sesión autenticada antes de acceder a datos', async () => {
    mocks.verifySession.mockRejectedValueOnce(new Error('unauthorized'))

    await expect(createInvoice(input)).rejects.toThrow('unauthorized')
    expect(mocks.from).not.toHaveBeenCalled()
    expect(mocks.rpc).not.toHaveBeenCalled()
  })

  it('valida líneas y normaliza datos fiscales antes de llamar a la RPC', async () => {
    await expect(createInvoice({ ...input, items: [] })).rejects.toThrow(
      'Añade al menos una línea'
    )
    expect(mocks.from).not.toHaveBeenCalled()
    expect(mocks.rpc).not.toHaveBeenCalled()

    await expect(createInvoice(input)).resolves.toBe('invoice-test-id')
    expect(mocks.from).toHaveBeenCalledWith('patients')
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        tax_id: 'X123',
        address: 'Test Street',
        postal_code: null,
      })
    )
    expect(mocks.rpc).toHaveBeenCalledWith('create_invoice', {
      p_series: 'F',
      p_issued_on: '2030-05-20',
      p_patient_id: 'patient-test-id',
      p_appointment_id: null,
      p_customer_name: 'Test Customer',
      p_customer_tax_id: 'X123',
      p_customer_address: 'Test Street',
      p_customer_postal_code: null,
      p_payment_method: null,
      p_observations: null,
      p_items: [{ description: 'Facial', amount: 100, treatment_id: 'f1' }],
    })
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/facturas')
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/citas')
  })

  it('rechaza importes no positivos o no finitos', async () => {
    await expect(
      createInvoice({ ...input, items: [{ ...input.items[0], amount: Number.NaN }] })
    ).rejects.toThrow('Todos los importes deben ser mayores que 0')
    expect(mocks.rpc).not.toHaveBeenCalled()
  })
})
