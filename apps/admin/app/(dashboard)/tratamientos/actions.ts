'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import type { TreatmentCategory, TreatmentVariant } from '@aesthetica/shared'
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
  image_urls: string[]
  variants: Array<Pick<TreatmentVariant, 'id' | 'name' | 'duration_min' | 'price_eur' | 'is_active'>>
}

function isMissingTreatmentVariantSchema(error: { code?: string; message: string }) {
  return ['PGRST200', 'PGRST205', '42P01', '42703', 'PGRST204'].includes(error.code ?? '') ||
    /treatment_variants|image_urls/i.test(error.message)
}

export async function saveTreatment(input: TreatmentInput) {
  await verifySession()

  if (!input.name.trim() || input.name.length > 150) throw new Error('El nombre debe tener entre 1 y 150 caracteres')
  if (!['facial', 'corporal', 'laser', 'capilar', 'bienestar'].includes(input.category)) throw new Error('Categoría no válida')
  if (!Number.isInteger(input.duration_min) || input.duration_min < 1) throw new Error('La duración debe ser de al menos un minuto')
  if (input.price_eur != null && (!Number.isFinite(input.price_eur) || input.price_eur < 0)) throw new Error('El precio no es válido')
  if (typeof input.description !== 'string' || input.description.length > 10000) throw new Error('La descripción no puede superar los 10.000 caracteres')
  if (!Array.isArray(input.variants) || input.variants.length > 20 || input.variants.some((variant) =>
    typeof variant?.name !== 'string' || !variant.name.trim() || variant.name.length > 150 || !Number.isInteger(variant.duration_min) ||
    variant.duration_min < 1 || !Number.isFinite(variant.price_eur) || variant.price_eur < 0
  )) throw new Error('Revisa las opciones de sesión y bono')
  if (new Set(input.variants.map((variant) => variant.name.trim().toLocaleLowerCase())).size !== input.variants.length) throw new Error('No repitas el nombre de una opción')
  if (!Array.isArray(input.image_urls) || input.image_urls.length > 8 || input.image_urls.some((url) => {
    try {
      const parsed = new URL(url)
      return !['http:', 'https:'].includes(parsed.protocol) || !parsed.pathname.includes('/storage/v1/object/public/treatment-images/')
    } catch {
      return true
    }
  })) throw new Error('Las fotos deben proceder del almacenamiento de tratamientos')

  const { error: variantSchemaError } = await supabaseAdmin
    .from('treatment_variants')
    .select('id')
    .limit(0)
  const hasVariantSchema = !variantSchemaError
  if (variantSchemaError && !isMissingTreatmentVariantSchema(variantSchemaError)) {
    throw new Error(variantSchemaError.message)
  }
  if (!hasVariantSchema && (input.variants.length > 0 || input.image_urls.length > 0)) {
    throw new Error('Para guardar bonos o fotos, aplica primero la migración de tratamientos en Supabase.')
  }

  const id = input.id ?? randomUUID()

  const treatmentValues: Record<string, unknown> = {
    id,
    name: input.name,
    category: input.category,
    description: input.description || null,
    duration_min: input.duration_min,
    price_eur: input.price_eur,
    is_active: input.is_active,
    image_url: input.image_urls[0] ?? null,
  }
  if (hasVariantSchema) treatmentValues.image_urls = input.image_urls
  const { error } = await supabaseAdmin.from('treatments').upsert(treatmentValues)

  if (error) throw new Error(error.message)

  const variants = input.variants.map((variant) => ({ ...variant, treatment_id: id }))
  if (hasVariantSchema && variants.length > 0) {
    const { error: variantsError } = await supabaseAdmin.from('treatment_variants').upsert(variants)
    if (variantsError) throw new Error(variantsError.message)
  }
  if (hasVariantSchema && input.id) {
    const activeIds = variants.filter((variant) => variant.is_active).map((variant) => variant.id)
    let query = supabaseAdmin.from('treatment_variants').update({ is_active: false }).eq('treatment_id', id)
    if (activeIds.length) query = query.not('id', 'in', `(${activeIds.join(',')})`)
    const { error: deactivateError } = await query
    if (deactivateError) throw new Error(deactivateError.message)
  }
  revalidatePath('/tratamientos')
}

export async function uploadTreatmentImage(formData: FormData): Promise<string> {
  await verifySession()
  const file = formData.get('file')
  if (!(file instanceof File)) throw new Error('Selecciona una imagen válida')
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    throw new Error('Formato no admitido. Usa JPG, PNG, WebP o AVIF.')
  }
  if (file.size > 5 * 1024 * 1024) throw new Error('Cada imagen debe pesar 5 MB o menos')
  const extension = file.type.split('/')[1].replace('jpeg', 'jpg')
  const path = `${randomUUID()}.${extension}`
  const { error } = await supabaseAdmin.storage.from('treatment-images').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    if (/bucket not found|does not exist|404/i.test(error.message)) {
      throw new Error('Aplica primero la migración de tratamientos en Supabase para habilitar la galería de fotos.')
    }
    throw new Error(error.message)
  }
  return supabaseAdmin.storage.from('treatment-images').getPublicUrl(path).data.publicUrl
}

export async function setTreatmentActive(id: string, is_active: boolean) {
  await verifySession()

  const { error } = await supabaseAdmin.from('treatments').update({ is_active }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/tratamientos')
}
