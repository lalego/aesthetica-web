import { notFound } from 'next/navigation'
import type { Treatment } from '@aesthetica/shared'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { TreatmentFormDialog } from '../treatment-form-dialog'

export const dynamic = 'force-dynamic'

export default async function EditTreatmentPage({ params }: PageProps<'/tratamientos/[id]'>) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('treatments')
    .select('*, image_urls, variants:treatment_variants(*)')
    .eq('id', id)
    .maybeSingle()

  if (error || !data) notFound()

  return <TreatmentFormDialog treatment={data as Treatment} fullPage hideTrigger />
}
