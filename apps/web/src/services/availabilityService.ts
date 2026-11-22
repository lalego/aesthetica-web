import { supabase } from '@/lib/supabase'

export const fetchAvailableSlots = async (
  date: string,
  treatmentId: string,
  variantId?: string | null
): Promise<string[]> => {
  const { data, error } = await supabase.rpc<string[]>('get_available_slots', {
    p_date: date,
    p_treatment_id: treatmentId,
    p_variant_id: variantId ?? null,
  })

  if (error) {
    console.warn('[availabilityService] No se pudieron cargar los huecos:', error.message)
    return []
  }

  return data ?? []
}
