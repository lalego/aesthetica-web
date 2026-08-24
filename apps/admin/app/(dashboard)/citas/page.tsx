import { supabaseAdmin } from '@/lib/supabase-admin'
import { AppointmentsTable, type AppointmentRow } from './appointments-table'

export const dynamic = 'force-dynamic'

export default async function CitasPage() {
  const { data, error } = await supabaseAdmin
    .from('appointments')
    .select(
      'id, scheduled_at, duration_min, status, notes, patients(full_name, email, phone), treatments(name)'
    )
    .order('scheduled_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Citas</h1>
      <AppointmentsTable appointments={(data ?? []) as unknown as AppointmentRow[]} />
    </div>
  )
}
