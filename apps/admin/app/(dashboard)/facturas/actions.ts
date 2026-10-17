'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifySession } from '@/lib/dal'
import { INVOICE_SERIES, MAX_INVOICE_ITEMS, type InvoiceSeries } from '@/lib/invoices'

export interface InvoiceItemInput {
  description: string
  amount: number
  treatment_id: string | null
}

export interface InvoiceInput {
  series: InvoiceSeries
  issued_on: string // YYYY-MM-DD
  patient_id: string
  appointment_id: string | null
  customer_name: string
  customer_tax_id: string
  customer_address: string
  customer_postal_code: string
  payment_method: string
  observations: string
  items: InvoiceItemInput[]
}

export async function createInvoice(input: InvoiceInput) {
  await verifySession()

  const items = input.items
    .map((item) => ({ ...item, description: item.description.trim() }))
    .filter((item) => item.description !== '')

  if (!INVOICE_SERIES.includes(input.series)) throw new Error('Serie no válida')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.issued_on)) throw new Error('Fecha no válida')
  if (!input.customer_name.trim()) throw new Error('Falta el nombre del cliente')
  if (items.length === 0) throw new Error('Añade al menos una línea')
  if (items.length > MAX_INVOICE_ITEMS) throw new Error(`Máximo ${MAX_INVOICE_ITEMS} líneas`)
  if (items.some((item) => !Number.isFinite(item.amount) || item.amount <= 0)) {
    throw new Error('Todos los importes deben ser mayores que 0')
  }

  const taxId = input.customer_tax_id.trim().toUpperCase() || null
  const address = input.customer_address.trim() || null
  const postalCode = input.customer_postal_code.trim() || null

  // Los datos fiscales se guardan también en el paciente para la próxima factura.
  const { error: patientError } = await supabaseAdmin
    .from('patients')
    .update({ tax_id: taxId, address, postal_code: postalCode, updated_at: new Date().toISOString() })
    .eq('id', input.patient_id)
  if (patientError) {
    throw new Error(
      patientError.code === '23505'
        ? 'Ese DNI/NIF ya pertenece a otro paciente'
        : patientError.message
    )
  }

  const { data, error } = await supabaseAdmin.rpc('create_invoice', {
    p_series: input.series,
    p_issued_on: input.issued_on,
    p_patient_id: input.patient_id,
    p_appointment_id: input.appointment_id,
    p_customer_name: input.customer_name.trim(),
    p_customer_tax_id: taxId,
    p_customer_address: address,
    p_customer_postal_code: postalCode,
    p_payment_method: input.payment_method.trim() || null,
    p_observations: input.observations.trim() || null,
    p_items: items,
  })
  if (error) {
    throw new Error(
      error.code === '23505' && error.message.includes('appointment_id')
        ? 'Esta cita ya tiene factura'
        : error.message
    )
  }

  revalidatePath('/facturas')
  revalidatePath('/citas')
  return data as string
}
