'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import type { TreatmentCategory } from '@aesthetica/shared'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { verifySession } from '@/lib/dal'

export interface TreatmentInput {
  id?: string
  name: string
  category: TreatmentCategory
  description: string
  duration_min: number
  price_eur: number | null
  is_active: boolean
}

export async function saveTreatment(input: TreatmentInput) {
  await verifySession()

  const id = input.id ?? randomUUID()

  const { error } = await supabaseAdmin.from('treatments').upsert({
    id,
    name: input.name,
    category: input.category,
    description: input.description || null,
    duration_min: input.duration_min,
    price_eur: input.price_eur,
    is_active: input.is_active,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/tratamientos')
}

export async function setTreatmentActive(id: string, is_active: boolean) {
  await verifySession()

  const { error } = await supabaseAdmin.from('treatments').update({ is_active }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/tratamientos')
}
