import { supabaseAdmin } from '@/lib/supabase-admin'
import { PatientsTable, type Patient } from './patients-table'

export const dynamic = 'force-dynamic'

export default async function PacientesPage() {
  const { data, error } = await supabaseAdmin
    .from('patients')
    .select('id, full_name, email, phone, gdpr_consent, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Pacientes</h1>
      <PatientsTable patients={(data ?? []) as Patient[]} />
    </div>
  )
}
