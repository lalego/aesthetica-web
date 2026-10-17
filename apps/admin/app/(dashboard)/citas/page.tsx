import { supabaseAdmin } from '@/lib/supabase-admin'
import type { BillingTreatment } from '@/lib/invoices'
import type { AppointmentRow } from './appointments-table'
import { CitasView } from './citas-view'

export const dynamic = 'force-dynamic'

export default async function CitasPage() {
  const [appointments, treatments] = await Promise.all([
    supabaseAdmin
      .from('appointments')
      .select(
        'id, scheduled_at, duration_min, status, notes, patient_id, treatment_id, patients(full_name, email, phone, tax_id, address, postal_code), treatments(name), invoices(id, number)'
      )
      .order('scheduled_at', { ascending: true }),
    supabaseAdmin
      .from('treatments')
      .select('id, name, category, price_eur, is_active')
      .order('category')
      .order('name'),
  ])

  const error = appointments.error ?? treatments.error
  if (error) throw new Error(error.message)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Citas</h1>
      <CitasView
        appointments={(appointments.data ?? []) as unknown as AppointmentRow[]}
        treatments={(treatments.data ?? []) as BillingTreatment[]}
      />
    </div>
  )
}
