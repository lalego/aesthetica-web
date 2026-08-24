import type { Treatment } from '@aesthetica/shared'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { TreatmentFormDialog } from './treatment-form-dialog'
import { TreatmentsTable } from './treatments-table'

export const dynamic = 'force-dynamic'

export default async function TratamientosPage() {
  const { data, error } = await supabaseAdmin
    .from('treatments')
    .select('*')
    .order('category')
    .order('name')

  if (error) throw new Error(error.message)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tratamientos</h1>
        <TreatmentFormDialog />
      </div>
      <TreatmentsTable treatments={(data ?? []) as Treatment[]} />
    </div>
  )
}
