import type { Treatment } from '@aesthetica/shared'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { TreatmentsTable } from './treatments-table'

export const dynamic = 'force-dynamic'

export default async function TratamientosPage() {
  const withVariants = await supabaseAdmin
    .from('treatments')
    .select('*, image_urls, variants:treatment_variants(*)')
    .order('category')
    .order('name')
  const legacy = withVariants.error
    ? await supabaseAdmin.from('treatments').select('*').order('category').order('name')
    : null
  const data = withVariants.error ? legacy?.data : withVariants.data
  const error = withVariants.error ? legacy?.error : null
  const needsTreatmentMigration = Boolean(
    withVariants.error && /treatment_variants|image_urls/i.test(withVariants.error.message),
  )

  if (error) throw new Error(error.message)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tratamientos</h1>
      </div>
      {needsTreatmentMigration && <p role="status" className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        El panel funciona con el esquema actual. Para guardar bonos y subir fotos, aplica primero <code>supabase/migrations/20261116_treatment_variants_and_images.sql</code> en Supabase.
      </p>}
      <TreatmentsTable treatments={(data ?? []) as Treatment[]} />
    </div>
  )
}
